function formatDate(dateString) {
    const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', options).format(date);
}

function formatDateTime(dateString) {
    const options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', options);
}

function formatForBirthdayInput(birthdayStr) {
    const birthdayDate = new Date(birthdayStr);

    const year = birthdayDate.getFullYear();
    const month = String(birthdayDate.getMonth() + 1).padStart(2, '0');
    const day = String(birthdayDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatCurrency(input) {
    const formattedCurrency = (input * 1000).toLocaleString('en-US');
    return formattedCurrency + "đ";
}

module.exports = { formatDate, formatDateTime, formatForBirthdayInput, formatCurrency };