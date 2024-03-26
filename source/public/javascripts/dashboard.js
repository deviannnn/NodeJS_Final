$(document).ready(function () {
    const currentDate = new Date().toISOString().split('T')[0];
    $('#startDate').val(currentDate);
    $('#endDate').val(currentDate);
    getReport({ timeframe: 'today' });

    let timeframe = 'today', startDate, endDate;
    $('.dropdown-item').on('click', function () {
        timeframe = $(this).data('value');

        $('#timeframe').text($(this).text() + ' ');
        if (timeframe === 'custom') {
            startDate = $('#startDate').val();
            endDate = $('#endDate').val();
            $('#custom-date').show();
            $('.dropleft').removeClass('ms-auto').addClass('ms-3');
        } else {
            $('#custom-date').hide();
            $('.dropleft').removeClass('ms-3').addClass('ms-auto');
        }

        const data = { timeframe, startDate, endDate };
        removeEmptyProperties(data);

        getReport(data);
    });

    $('#startDate, #endDate').on('change', function () {
        startDate = $('#startDate').val();
        endDate = $('#endDate').val();

        getReport({ timeframe, startDate, endDate });
    });

    function getReport(data) {
        $.ajax({
            url: '/order/getByTimeFrame',
            type: 'POST',
            dataType: 'json',
            data: data,
            success: function (response) {
                displayReport(response);
            },
            error: function (xhr, status, error) {
                let msg = '';
                if (xhr.status === 400) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.type === 0 && response.errors && response.errors.length > 0) {
                        const inputError = response.errors;
                        inputError.forEach(input => {
                            $(`#${input.field}`).removeClass('is-valid').addClass('is-invalid');
                            msg += input.msg + '<br>';

                        })
                    } else {
                        msg = response.message;
                    }
                } else {
                    msg = error;
                }
                $('#message-modal-fail').html(msg);
                $('#failModal').modal('show');
            }
        });
    }

    function displayReport(response) {
        const percentSales = response.analytics.percentSales;
        const percentOrders = response.analytics.percentOrders;
        const diffRevenue = response.analytics.diffRevenue;
        const variantContribution = response.analytics.variantContribution;

        const startDate = formatDateTime(response.filter.created['$gte']);
        const endDate = formatDateTime(response.filter.created['$lt']);
        $('.frametime-date').text(`${startDate} - ${endDate}`);

        $('#totalSales').text(formatCurrency(response.analytics.totalSales));
        displayPercentAnalytics('#percentSales', percentSales);
        $('#totalOrders').text(response.analytics.totalOrders);
        displayPercentAnalytics('#percentOrders', percentOrders);
        $('#revenue').text(formatCurrency(response.analytics.revenue));
        $('#diffRevenue').text(`${diffRevenue > 0 ? '+' : ''}` + formatCurrency(diffRevenue));
        displayFrametimeText(timeframe);

        $('#top-products').empty();
        if (Object.keys(variantContribution).length > 0) {
            const sortedEntries = Object.entries(variantContribution).sort((a, b) => b[1] - a[1]);

            sortedEntries.forEach(([key, value]) => {
                const item = `
                <li class="list-group-item border-0 d-flex align-items-center px-0 mb-2">
                    <div class="w-100">
                        <div class="d-flex align-items-center mb-2">
                            <span class="me-2 text-sm font-weight-bold text-capitalize ms-2">${key}</span>
                            <span class="ms-auto text-sm font-weight-bold">${value}%</span>
                        </div>
                        <div>
                            <div class="progress progress-md">
                                <div class="progress-bar bg-gradient-dark" style="width: ${value}%" role="progressbar"
                                    aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                        </div>
                    </div>
                </li>`;

                $('#top-products').append(item);
            })
        } else {
            $('#top-products').append(`
                <div class="alert alert-light m-0" role="alert">
                    <strong>Ooops!</strong> No data.
                </div>`);
        }

        $('#top-orders').empty();
        if (response.orders.length > 0) {
            $('.table-responsive .alert').hide();
            $('.table-responsive table').show();

            response.orders.forEach((order, index) => {
                const item = `
                <tr>
                    <td>
                        <p class="text-sm font-weight-bold mb-0">${index + 1}. #${order.Id}</p>
                    </td>
                    <td>
                        <p class="text-sm font-weight-bold mb-0">${formatCurrency(order.sales)}</p>
                    </td>
                    <td>
                        <p class="text-sm font-weight-bold mb-0">${order.date}</p>
                    </td>
                </tr>`

                $('#top-orders').append(item);
            })
        } else {
            $('.table-responsive table').hide();
            $('.table-responsive .alert').show();
        }
    }
});

function displayPercentAnalytics(selector, value) {
    if (value < 0) {
        return $(selector).text(`${value}%`).removeClass().addClass('text-danger');
    } else if (value >= 0) {
        return $(selector).text(`+ ${value}%`).removeClass().addClass('text-success');
    }
}

function displayFrametimeText(value) {
    switch (value) {
        case 'today':
            return $('.frametime-text').text('since yesterday');
        case 'thisweek':
            return $('.frametime-text').text('since previous week');
        case 'thismonth':
            return $('.frametime-text').text('since previous month');
        default:
            $('#percentSales').html('&nbsp;');
            $('#percentOrders').html('&nbsp;');
            $('#diffRevenue').html('&nbsp;');
            $('.frametime-text').text('');
            return;
    }
}

function removeEmptyProperties(obj) {
    for (const key in obj) {
        if (obj[key] === '' || obj[key] === undefined) {
            delete obj[key];
        }
    }
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return formattedDate;
}

function formatCurrency(input) {
    const formattedCurrency = (input * 1000).toLocaleString('en-US');
    return formattedCurrency + "đ";
}