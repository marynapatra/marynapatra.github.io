let submitButton = document.getElementById('chart-button');
let currency = document.getElementById('currency');
let startDate = document.getElementById('start-date');
let endDate = document.getElementById('end-date');
let finalData = [];
let iteration = 0;
let countDay = 0;
let newDate, curVal;
let containerForChart = document.querySelector('.container-for-chart');
const BASE_URL = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode="



submitButton.addEventListener('click', function () {

    if (!checkEmptyDate(startDate) || !checkEmptyDate(endDate)) {
        viewMessage('class', 'error-message', 'Date field is empty. Enter the date, please.')
    } else {
        viewMessage('class', 'loader');
        finalData = [];
        curVal = currency.value;
        countDay = miliToCountDate(calcRangeDate(startDate, endDate));
        let startDateSplit = startDate.value.split('-');                              
        newDate = new Date(startDateSplit[0], startDateSplit[1] - 1, startDateSplit[2]);
        iteration = 0;
        timeoutCycle();
    }
})

function timeoutCycle() {
    if (iteration <= countDay) {
        let dayRequest = new Date(newDate.getFullYear(),
            newDate.getMonth(), newDate.getDate() + iteration);
        let stringDate = dateToString(dayRequest);
        let _URI = `${BASE_URL}${curVal}&date=${stringDate}&json`;
        fetchRequest(_URI);
    }
}

function fetchRequest(URI) {
    fetch(URI, {
            method: "GET",
        })
        .then(checkStatus)
        .then(parseJSON)
        .then(function (data) {
            let temporaryArr = [];
            if (data[0] != undefined) {
                let dateArr = data[0].exchangedate.split('.');
                let correctDate = new Date(dateArr[2], dateArr[1] - 1, dateArr[0]);

                temporaryArr.push(correctDate.getTime() + 10800000);
                temporaryArr.push(data[0].rate);
                finalData.push(temporaryArr);
                iteration++;
                setTimeout(timeoutCycle, 3);
            }
        })
        .then(function () {
            if (iteration > countDay) {
                finalData.sort(function (a, b) {
                    return (a[0] - b[0]);
                });
                createChart();
            }
        })
        .catch(function () {
            viewMessage('class', 'error-message', 'Something went wrong! Please try again...');
            let error = new Error('data[0] undefined');
            throw error;
        })
}


function checkStatus(responce) {
    if (responce.status >= 200 && responce.status < 300) {
        return responce
    } else {
        let error = new Error(responce.statusText)
        error.responce = responce;
        throw error
    }
}

function checkEmptyDate(el) {
    let result = (el.value == "") ? false : true
    return result;
}

function parseJSON(responce) {
    return responce.json();
}

function createChart() {
    Highcharts.chart('container-chart', {
        chart: {
            style: "fontFamily: 'Roboto', sans-serif",
            zoomType: 'x'
        },
        title: {
            text: 'UAH to ' + currency.value.toUpperCase() + ' exchange rate over time'
        },
        subtitle: {
            text: document.ontouchstart === undefined ?
                'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Exchange rate'
            }
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },

        series: [{
            type: 'area',
            name: 'UAH to ' + currency.value.toUpperCase(),
            data: finalData
        }]
    });
}

/*return milliseconds of range date */
function calcRangeDate(startEl, endEl) {
    let startResult = Date.parse(startEl.value);
    let endResult = Date.parse(endEl.value);
    return endResult - startResult;
}

/* convert milliseconds to digit days */
function miliToCountDate(milliseconds) {
    let seconds = milliseconds / 1000;
    let minutes = seconds / 60;
    let hour = minutes / 60;
    let day = hour / 24;
    return day;
}

/*convert date to correct request string */
function dateToString(date) {
    let dateStr = '';
    dateStr += date.getFullYear();
    (date.getMonth() < 9) ? dateStr += "0" + (date.getMonth() + 1): dateStr += date.getMonth() + 1;
    (date.getDate() < 9) ? dateStr += "0" + date.getDate(): dateStr += date.getDate();
    return dateStr;
}

function viewMessage(selector, name_selector, message) {
    if (document.querySelector('#container-chart')) {
        document.querySelector('#container-chart').remove();
    }
    let container = document.createElement('div');
    container.setAttribute('id', "container-chart");


    let el = document.createElement('div');
    containerForChart.appendChild(container);
    el.setAttribute(selector, name_selector);
    if (message) {
        el.innerText = message
    }
    container.appendChild(el)
}

function definesToday() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    today = yyyy + '-' + mm + '-' + dd;
    return today;
}

endDate.addEventListener('change', function () {
    startDate.setAttribute("max", endDate.value)
});
startDate.addEventListener('change', function () {
    endDate.setAttribute('min', startDate.value)
});

document.getElementById("end-date").setAttribute("max", definesToday());
document.getElementById("start-date").setAttribute("max", definesToday());