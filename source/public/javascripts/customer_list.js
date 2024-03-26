$(document).ready(function () {
    $('#example2').DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": false,
        "ordering": true,
        "info": true,
        "autoWidth": false,
    });
})

// Handler
$('tbody').on('click', '.edit, .delete, .time', function () {
    const Id = $(this).data("id");

    const clickedElement = this;

    $.ajax({
        url: '/customer/get',
        method: 'POST',
        dataType: 'json',
        data: { Id },
        success: function (response) {
            if (response.success) {
                const customer = response.customer;
                const orders = response.orders;

                switch (true) {
                    case $(clickedElement).hasClass('edit'):
                        displayCustomerEdit(customer);
                        break;

                    case $(clickedElement).hasClass('delete'):
                        $('.current-customer').text(`(${customer.name})`);
                        $('#delete-customer-id').val(customer.Id);
                        $('#deleteModal').modal('show');
                        break;

                    case $(clickedElement).hasClass('time'):
                        displayCustomerPH(customer, orders);
                        break;

                    default:
                        break;
                }
            }
        },
        error: function (xhr, status, error) {
            let msg;
            if (xhr.status === 400) {
                const response = JSON.parse(xhr.responseText);
                msg = response.message;
            } else {
                msg = error;
            }
            $('#message-modal-fail').text(msg);
            $('#failModal').modal('show');
        }
    });
});

// Purchase History
function displayCustomerPH(customer, orders) {
    $('.current-customer').text(`(${customer.name})`);
    const phList = $('#purchase-history-list');
    phList.empty();

    if (orders.length > 0) {
        orders.forEach(order => {
            const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

            let items = ``;
            order.items.forEach(item => {
                items += `
                    <tr>
                        <td class="text-start">(${item.barcode}) ${item.name} ${item.color}</td>
                        <td class="ps-4">${item.quantity}</td>
                        <td class="ps-4" colspan="2">${formatCurrency(item.price)}</td>
                        <td class="ps-4 text-end">${formatCurrency(item.amount)}</td>
                    </tr>`;
            });

            const purchase = `
                <div class="timeline-block mb-3">
                    <span class="timeline-step">
                        <i class="ni ni-cart text-success text-gradient"></i>
                    </span>
                    <div class="timeline-content" style="max-width: none;">
                        <h6 class="text-dark text-sm font-weight-bold mb-0">#${order.Id} | Cashier: ${order.cashier}
                        </h6>
                        <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">
                            ${order.date}
                        </p>
                        <p class="row h6 text-sm mt-3 mb-1">
                            <span class="col-6 col-md-4">
                                Type: <span class="text-uppercase">${order.payment.type}</span><br>
                                Method: <span class="text-uppercase">${order.payment.method}</span>
                            </span>
                            <span class="col-6 col-md-4">
                                Total Amount: ${formatCurrency(order.summaryAmount.totalAmount)}<br>
                                Total Items: ${totalItems}
                            </span>
                            <span class="col-6 col-md-4 mt-md-0 mt-2">
                                Receive: ${formatCurrency(order.payment.receive)}<br>
                                Change: ${formatCurrency(order.payment.change)}
                            </span>
                        </p>
                        <div class="accordion">
                            <div class="accordion-item mb-0">
                                <h6 class="accordion-header">
                                    <button
                                        class="accordion-button border-bottom font-weight-bold collapsed ps-0"
                                        type="button" data-bs-toggle="collapse"
                                        data-bs-target="#a${order.Id}" aria-expanded="false"
                                        aria-controls="${order.Id}">
                                        <span class="text-info text-gradient">Details</span>
                                        <i class="collapse-close fa fa-plus text-xs pt-1 position-absolute end-0 me-3"
                                            aria-hidden="true"></i>
                                        <i class="collapse-open fa fa-minus text-xs pt-1 position-absolute end-0 me-3"
                                            aria-hidden="true"></i>
                                    </button>
                                </h6>
                                <div id="a${order.Id}" class="accordion-collapse collapse">
                                    <div class="accordion-body text-sm opacity-8 ps-0 pt-0">
                                        <div class="table-responsive">
                                            <table class="table text-right">
                                                <thead class="bg-default">
                                                    <tr>
                                                        <th scope="col" class="pe-2 h7 text-dark text-start ps-2">
                                                            Item</th>
                                                        <th scope="col" class="pe-2 h7 text-dark">Qty</th>
                                                        <th scope="col" class="pe-2 h7 text-dark" colspan="2">
                                                            Price</th>
                                                        <th scope="col" class="pe-2 h7 text-dark text-end">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${items}
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <th></th>
                                                        <th></th>
                                                        <th class="h7 text-dark ps-4 pb-0" colspan="2">Sub Total:</th>
                                                        <th colspan="1" class="text-end h7 text-dark ps-4 pb-0">
                                                            ${formatCurrency(order.summaryAmount.subTotal)}
                                                            </th>
                                                    </tr>
                                                    <tr>
                                                        <th></th>
                                                        <th></th>
                                                        <th class="h7 text-dark ps-4 pb-0" colspan="2">Discount:</th>
                                                        <th colspan="1" class="text-end h7 text-dark ps-4 pb-0">
                                                        ${formatCurrency(order.summaryAmount.discount)}
                                                        </th>
                                                    </tr>
                                                    <tr>
                                                        <th></th>
                                                        <th></th>
                                                        <th class="h7 text-dark ps-4 pb-0" colspan="2">Voucher:</th>
                                                        <th colspan="1" class="text-end h7 text-dark ps-4 pb-0">
                                                        ${formatCurrency(order.summaryAmount.voucher)}
                                                        </th>
                                                    </tr>
                                                    <tr>
                                                        <th></th>
                                                        <th></th>
                                                        <th class="h7 text-dark ps-4 pb-0" colspan="2">Grand Total:
                                                        </th>
                                                        <th colspan="1" class="text-end h7 text-dark ps-4 pb-0">
                                                        ${formatCurrency(order.summaryAmount.totalAmount)}
                                                        </th>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

            phList.append(purchase);
        });
    } else {
        const noVariantMessage = `
            <div class="alert alert-light m-0" role="alert">
                <strong>Ooops!</strong> This customer has no purchase history.
            </div>`;

        phList.append(noVariantMessage);
    }

    $('#timelineModal').modal('show');
}

// Edit
function displayCustomerEdit(customer) {
    $('#Id').val(customer.Id);
    $('#name').val(customer.name);
    $('#phone').val(customer.phone);
    $('#editModal').modal('show');
}

function updateCustomer() {
    const Id = $('#Id').val();
    const name = $('#name').val().trim();
    const phone = $('#phone').val().trim();
    const password = $('#password').val().trim();

    const data = { Id, name, phone, password };
    removeEmptyProperties(data);

    $.ajax({
        url: '/customer/update',
        method: 'PUT',
        dataType: 'json',
        data: data,
        success: function (response) {
            if (response.success) {
                $('#modal-created-title').text(response.title);
                $('#modal-created-msg').text(response.message);
                $('#createdModal').modal('show');
            }
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
        },
        complete: function () {
            $('#password').val('');
        }
    });
}

// Delete
function confirmDel() {
    const customerId = $('#delete-customer-id').val();
    const listItem = $(`[data-id="${customerId}"]`).closest('tr');

    $.ajax({
        url: '/customer/remove',
        method: 'DELETE',
        dataType: 'json',
        data: { Id: customerId },
        success: function (response) {
            if (response.success) {
                listItem.remove();
                $('#btn-ok-reload').hide();
                $('#btn-ok-noreload').show();

                $('#modal-success-title').text(response.title);
                $('#modal-success-msg').text(response.message);
                $('#successModal').modal('show');
            }
        },
        error: function (xhr, status, error) {
            let msg;
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

function removeEmptyProperties(obj) {
    for (const key in obj) {
        if (obj[key] === '' || obj[key] === undefined) {
            delete obj[key];
        }
    }
}

$('#editModal').on('hidden.bs.modal', function () {
    $('#Id').val('');
    $('#name').val('').removeClass('is-invalid');
    $('#phone').val('').removeClass('is-invalid');
    $('#password').val('');
});

function formatCurrency(input) {
    const formattedCurrency = (input * 1000).toLocaleString('en-US');
    return formattedCurrency + "đ";
}