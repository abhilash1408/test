var monthsLongNameArray = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
var monthsShortNameArray = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function findGivenDateControl(configDateValue) {
    //get the specified date from the request
    var givenDate = new Date(configDateValue);
    //debug
    console.log("Date to search: " + givenDate);
    //try {
        var lookupMonthDataControl = traverseAndGetCalendarControl(configDateValue);
        //debug
      //  if (lookupMonthDataControl == null) {
     //       console.log('unable to find');
     //   }
     //   else {
            var currentDates = lookupMonthDataControl[0].querySelectorAll('td');
            var selectedDateControl;
            for (var i = 0, len = currentDates.length; i < len; i++) {
                var anchor = currentDates[i].querySelector('a');
                if (anchor != null) {
                    if (anchor.innerText == givenDate.getDate()) {
                        selectedDateControl = currentDates[i];
                        anchor.click();
                        break;
                    }
                }
            }
      //  }
        //Return the selected Date control back for clicking
        return selectedDateControl;
   // }
   // catch (error) {
    //    console.log("Error occured in calendar script.Manually filling dates.");
    //    return null;
   // }
}

//private helper method
function traverseAndGetCalendarControl(configDateValue) {
    var lookupMonthDataControl = null;
    var loopingCounter = 0;
    while (true) {
        loopingCounter++;
        //get the specified date from the requests
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
        // var givenMonthLongNameIndex = monthsLongNameArray.indexOf(longMonthName.trim().toLowerCase());
        // var givenMontShorthNameIndex = monthsShortNameArray.indexOf(shortMonthName.trim().toLowerCase());

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
        var allDatePickers = document.querySelector("div[id*='ib-calendar']");// $("div[class*='ui-datepicker-div']");

        var activeFromCalendarID;
       /* for (var i = 0; i < allDatePickers.length; i++) {
            if (allDatePickers[i].style.cssText.includes("display: block;")) {
                activeFromCalendarID = allDatePickers[i].id;
            }
        }*/
        ///When the calendar is opened, it shows two months, viz. the current and the next.
        ///So using the given date, we need to traverse to the correct month and then choose the date given.
        var fromCalendarHtmlControls = document.getElementsByClassName("dl-datepicker-group-0")[0];

        //Get the current month
        var currentTableMonthDataControls = fromCalendarHtmlControls.getElementsByClassName('dl-datepicker-calendar');
       // var currentMonthNameControls = currentTableMonthDataControls.previousSibling;
        var currentMonth = fromCalendarHtmlControls.getElementsByClassName('dl-datepicker-month-0')[0].innerText;
        var currentMonthLongNameIndex = monthsLongNameArray.indexOf(currentMonth.trim().toLowerCase());
        var currentMonthShortNameIndex = monthsShortNameArray.indexOf(currentMonth.substring(0, 3).toLowerCase());
        //Get the year
        var currentYear = fromCalendarHtmlControls.getElementsByClassName('dl-datepicker-year-0')[0].innerText;
        //Get the Prev Month control to traverse the calendar months --> this is very important as the phantom web driver has a cache page, so if the previous
        //request was in future, and the current request is present, then we have to move to the current month using the previous page control
        var prevPageControl = document.querySelector("div.calenderContainer > div > div.calPrevNextBtnCont > a.dl-datepicker-0");// currentMonthNameControls.querySelector('a[class*="datepicker-prev"]');


        var toCalendarHtmlControls = document.getElementsByClassName("dl-datepicker-group-1")[0];
        //Get the next month
        var nextMonthTableDataControls = toCalendarHtmlControls.getElementsByClassName('dl-datepicker-calendar');
        //var nextMonthsNameControls = nextMonthTableDataControls.previousSibling;
        var nextMonth = toCalendarHtmlControls.getElementsByClassName('dl-datepicker-month-1')[0].innerText;
        var nextMonthLongNameIndex = monthsLongNameArray.indexOf(nextMonth.trim().toLowerCase());
        var nextShortLongNameIndex = monthsShortNameArray.indexOf(nextMonth.substring(0, 3).toLowerCase());
        //Get the year
        var nextMonthsYear = toCalendarHtmlControls.getElementsByClassName('dl-datepicker-year-1')[0].innerText;;
        //Get the Next Months control to traverse the calendar months
        var nextPageControl = document.querySelector("div.calenderContainer > div > div.calPrevNextBtnCont > a.dl-datepicker-1");

        //debug
        //console.log("current month long name given Index:" + currentMonthLongNameIndex + " current month short name Index:" + currentMonthShortNameIndex);
        //console.log("next month long name given Index:" + nextMonthLongNameIndex + " next month short name Index:" + nextShortLongNameIndex);
        //console.log("current month:" + currentMonth.trim().toLowerCase() + "  next month:" + nextMonth.trim().toLowerCase() + " long given month:" + longMonthName.trim().toLowerCase() + " short given month:" + shortMonthName.trim().toLowerCase());
        if ((currentMonthLongNameIndex > givenMonthLongNameIndex || currentMonthShortNameIndex > givenMontShorthNameIndex) && currentYear >= givenDate.getFullYear()) {
            //debug
            //console.log("need to go back in the calendar");
            if (prevPageControl != null) {
                prevPageControl.click();
            }
            if (loopingCounter == 10) {
                break;
            }
        }
        else {
            if (currentMonth.trim().toLowerCase() == longMonthName.trim().toLowerCase() || currentMonth.trim().toLowerCase() == shortMonthName.trim().toLowerCase()) {
                //debug
                //console.log("current month:" + currentMonth);
                lookupMonthDataControl = currentTableMonthDataControls;
                break;
            }
            else if (nextMonth.trim().toLowerCase() == longMonthName.trim().toLowerCase() || nextMonth.trim().toLowerCase() == shortMonthName.trim().toLowerCase()) {
                //debug
                //console.log("next month:" + nextMonth);
                lookupMonthDataControl = nextMonthTableDataControls;
                break;
            }
            else if (lookupMonthDataControl == null) {
                //move to the next two months, in total we are going 6 months in future
                //don't want to loop more than 3 times.. as that's an invalid date duration
                //debug
                //console.log("looping to next calendar: " + loopingCounter);
                if (nextPageControl != null) {
                    nextPageControl.click();
                }
                if (loopingCounter == 10) {
                    break;
                }
            }
        }
    }
    return lookupMonthDataControl;
}
