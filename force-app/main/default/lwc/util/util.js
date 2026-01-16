const mapdataTableAttrib = (columns, data) => {
    columns.forEach(ele => {
        data.forEach(d => {
            if(!d[ele.fieldName]){
                d[ele.fieldName] = '';
            }
        });
    });
}
const timeDifference = (current, previous) => {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        return Math.round(elapsed / 1000) + ' second(s) ago';
    } else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minute(s) ago';
    } else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hour(s) ago';
    } else if (elapsed < msPerMonth) {
        return +Math.round(elapsed / msPerDay) + ' day(s) ago';
    } else if (elapsed < msPerYear) {
        return +Math.round(elapsed / msPerMonth) + ' month(s) ago';
    } else {
        return +Math.round(elapsed / msPerYear) + ' year(s) ago';
    }
}
export { mapdataTableAttrib, timeDifference };