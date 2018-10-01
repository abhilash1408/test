/// find all the div having the datepicker using $( "div[class*='hasDatepicker']" )
/// then find the one which is currently shown as class style will be show:block
/// then look for the From datepicker calendar which will have it in it's name  as $("div[class*='hasDatepicker']")[0].className
/// then get to the table child node which is housing the calendar dates
/// then put the table html in variable and run a queryselector for intended date and perform click
/// NOTE: This has to be repeated for the retrun date calendar all, after moving focus to the return input box.

var monthsLongNameArray = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
var monthsShortNameArray = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function findGivenDateControl(configDateValue) {
    //get the specified date from the request
    var givenDate = new Date(configDateValue);
    //debug
    console.log("Date to search: " + givenDate);

    var lookupMonthDataControl = traverseAndGetCalendarControl(configDateValue);
    //debug
    if (lookupMonthDataControl == null) {
        console.log('unable to find');
    }
    else {
        var currentDates = lookupMonthDataControl.querySelectorAll('td');
        var selectedDateControl;
        for (var i = 0, len = currentDates.length; i < len; i++) {
            var anchor = currentDates[i].querySelector('a');
            if (anchor != null) {
                if (anchor.innerText == givenDate.getDate()) {
                    selectedDateControl = currentDates[i];
                    break;
                }
            }
        }
    }
    //Return the selected Date control back for clicking
    return selectedDateControl;
}

//private helper method
function traverseAndGetCalendarControl(configDateValue) {
    var lookupMonthDataControl = null;
    var loopingCounter = 0;
    while (true) {
        loopingCounter++;
        //get the specified date from the request
        var givenDate = new Date(configDateValue),
        locale = "en-us",
        longMonthName = givenDate.toLocaleString(locale, {
            month: "long"
        }).split(" ")[0],
        shortMonthName = givenDate.toLocaleString(locale, {
            month: "short"
        }).split(" ")[0].substring(0, 3);

        var monthIndex = givenDate.getMonth();
        console.log("Month Index :" + monthIndex);
        var givenMonthLongNameIndex = monthIndex;
        var givenMontShorthNameIndex = monthIndex;

        longMonthName = monthsLongNameArray[monthIndex];
        console.log("Long Month Name :" + longMonthName);
        shortMonthName = monthsShortNameArray[monthIndex];
        console.log("Short Month Name :" + shortMonthName);
        if (longMonthName == "" || shortMonthName == "") {
            console.log("Invalid Month Name.");
            retrun;
        }
        //once the date input box is clicked, it shows the calendar popup, from here we have to get the active calendar months, as at a time only two calendar months are shown
        //we use the css style of visibility to get the current calendar html block
        var allDatePickers = $("div[id*='ui-datepicker-div']");

        var activeFromCalendarID;
        for (var i = 0; i < allDatePickers.length; i++) {
            if (allDatePickers[i].style.cssText.includes("display: block;")) {
                activeFromCalendarID = allDatePickers[i].id;
            }
        }
        ///When the calendar is opened, it shows two months, viz. the current and the next.
        ///So using the given date, we need to traverse to the correct month and then choose the date given.
        var fromCalendarHtmlControls = document.getElementById(activeFromCalendarID);

        //Get the current month
        var currentTableMonthDataControls = fromCalendarHtmlControls.getElementsByTagName('table')[0];
        var cc = fromCalendarHtmlControls.getElementsByTagName('div')[0];
        var currentMonthNameControls = cc.previousSibling;
        var currentMonth = cc.querySelector('span[class*="month"]').innerText;
        var currentMonthLongNameIndex = monthsLongNameArray.indexOf(currentMonth.trim().toLowerCase());
        var currentMonthShortNameIndex = monthsShortNameArray.indexOf(currentMonth.substring(0, 3).toLowerCase());
        //Get the year
        var prevPageControl = cc.querySelector('a[class*="datepicker-prev"]');

        //Get the next month
        //var nextMonthTableDataControls = fromCalendarHtmlControls.getElementsByTagName('table')[1];
        var lookupMonthDataControl = null;
        var nextPageControl = cc.querySelector('a[class*="datepicker-next"]');
        if (currentMonthLongNameIndex > givenMonthLongNameIndex || currentMonthShortNameIndex > givenMontShorthNameIndex) {
            //debug
            //console.log("need to go back in the calendar");
            prevPageControl.click();
            if (loopingCounter == 12) {
                break;
            }
        }
        else {
            if (currentMonth.trim().toLowerCase() == longMonthName.trim().toLowerCase() || currentMonth.trim().toLowerCase() == shortMonthName.trim().toLowerCase()) {
                lookupMonthDataControl = currentTableMonthDataControls;
                break;
            }
            else if (lookupMonthDataControl == null) {
                nextPageControl.click();
                if (loopingCounter == 12) {
                    break;
                }
            }
        }
    }
    return lookupMonthDataControl;
}
