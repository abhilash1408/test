var {Page} = require("./Page.js");

class SpecManager {
  constructor(configuration){
    this._configuration = configuration;
  }

  pages(){
    let navigationPages = [];
    // Remove all steps from spec which are not required
    let _pages = Object.entries(this._configuration.spec()).filter(([k,v]) => this._configuration.spec()[k]["isRequired"] && this._configuration.spec()[k]["type"] != "main").map(([k,v]) => ({[k]:v}));
    // Get the starting page.
    let _startPage = Object.entries(this._configuration.spec()).filter(([k,v]) => this._configuration.spec()[k]["type"] == "main").map(([k,v]) => ({[k]:v}))[0];
    // Push the start page with index 0.
    navigationPages.push(Page.create(_startPage[Object.keys(_startPage)[0]], 1, this._configuration));
    // Generate the navigation flow at run time based on steps and other parameters
    let navgiationFlow = generateNavigationFlow(_pages);
    let parent_Id = Object.entries(navgiationFlow).filter(([k,v]) => navgiationFlow[k]['id'] == 1).map(([k,v]) => ({[k]:v}))[0][0]['id'];
    let index = 1;
    navigationPages.concat(generateNavigationPages(parent_Id, index, this._configuration, navgiationFlow, navigationPages));
    return navigationPages;
  }

  static create(configuration){
    return new SpecManager(configuration);
  }
}

/**
 * This method navigates through the created flow and generates a list of pages to be navigated for crawling.
 *
 * @param {integer}      parent_Id        The parent page id to navigate from.
 * @param {integer}      index            The level of the page in the navigation flow.
 * @param {class}        configuration    The configuration class object.
 * @param {dictionary}   runtimeFlow      The navigation flow created at run time.
 * @param {array}        navigationPages  The list of page object.
 *
 * @return {array}       Returns the list of pages to be navigated.
 */
function generateNavigationPages(parent_Id, index, configuration, runtimeFlow, navigationPages){
  for(let step of runtimeFlow){
    if(step.id == parent_Id) continue;
    if (step.parent == parent_Id)
    {
      index += 1;
      let nextStep = Object.entries(configuration.spec()).filter(([k,v]) => configuration.spec()[k]["type"] == step.type).map(([k,v]) => ({[k]:v}))[0];
      navigationPages.push(Page.create(nextStep[Object.keys(nextStep)[0]], index, configuration));
      navigationPages.concat(generateNavigationPages(step.id, index, configuration, runtimeFlow, navigationPages));
    }
  }
  return navigationPages;
}

/**
 * This method verifies the values present in the spec object and creates the final navigation flow.
 *
 * @param {array}   _pages    The list of steps defined in the config.
 *
 * @return {dictionary}       Returns the final navigation flow for the framework to follow.
 */
function generateNavigationFlow(_pages){
  let tempNavigationFlow = masterNavigationFlow;
  // Filter the steps which are not required as defined in the config.
  for (let step of masterNavigationFlow){
    if (step.id == 1) continue;
    let type = step.type;
    let typeSpec = _pages.reduce(function(filteredPages, _page) {
      if (_page[Object.keys(_page)[0]]["type"] == type) filteredPages.push(_page);
      return filteredPages;
    }, []);
    if (typeSpec.length == 0){
      let p = 0;
      tempNavigationFlow = tempNavigationFlow.reduce(function(navigationFlow, step) {
        p = (step.type == type) ? step.id : p;
        if (step["type"] != type) {
          if ((step.parent) && (step.parent.indexOf(p) != -1)) step.parent.splice(step.parent.indexOf(p), 1 );
          navigationFlow.push(step);
        }
        return navigationFlow;
      }, []);
    }
  }
  // Update the parent for the flow generatd at run time.
  tempNavigationFlow = tempNavigationFlow.reduce(function(navigationFlow, step) {
    if (step.parent)
    {
      var max_parent = Math.max(...step.parent);
      step.parent = max_parent;
    }
    navigationFlow.push(step);
    return navigationFlow;
  }, []);
  return tempNavigationFlow
}

var masterNavigationFlow = [
  {
    "id": 1,
    "type": "main",
    "parent": null
  },
  {
    "id": 2,
    "type": "advance search",
    "parent": [1]
  },
  {
    "id": 3,
    "type": "calendar",
    "parent": [1, 2]
  },
  {
    "id": 4,
    "type": "listing",
    "parent": [1, 2, 3]
  },
  {
    "id": 5,
    "type": "outbound",
    "parent": [1, 2]
  },
  {
    "id": 6,
    "type": "inbound",
    "parent": [5]
  },
  {
    "id": 7,
    "type": "detail",
    "parent": [4, 6]
  }
]

module.exports = {SpecManager}
