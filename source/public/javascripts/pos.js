$(document).ready(function () {
    $('#searchResults').css('width', $('#variantValue').outerWidth());

    $(window).resize(function () {
        $('#searchResults').css('width', $('#variantValue').outerWidth());
    });

    $('#searchCustomer').css('width', $('#customerValue').outerWidth());

    $(window).resize(function () {
        $('#searchCustomer').css('width', $('#customerValue').outerWidth());
    });
});

// Search
$('#variantValue').on('input', function () {
    const searchTerm = $(this).val().trim();

    if (searchTerm !== '') {
        $.ajax({
            url: 'variant/search',
            method: 'POST',
            dataType: 'json',
            data: { searchTerm: searchTerm },
            success: function (data) {
                displaySearchResults(data);
            },
            error: function (error) {
                console.error('Error fetching search results:', error);
            }
        });
    } else {
        $('#searchResults').empty().hide();
    }
})

function displaySearchResults(results) {
    $('#searchResults').empty().show();

    if (results.length > 0) {
        results.forEach(function (result) {
            const resultText = `(${result.barcode}) ${result.productName} - ${result.color} `;
            const imgsrc = `/uploads/product_variants/${result.img !== 'default.png' ? `${result.productId}/` : ''}${result.img}`;
            const listItem = `
                <li data-variant-name="${resultText}" data-variant-color="${result.color}"
                    data-variant-ref="${result._id}" data-variant-price="${result.price}" 
                    data-variant-img="${imgsrc}">
                    <a class="dropdown-item"><img class="search-img me-2" src="${imgsrc}" />${resultText}</a>
                </li>`;
            $('#searchResults').append(listItem);
        });
    } else {
        $('#searchResults').append('<li><a class="dropdown-item">No results found</a></li>');
    }
}

$('#searchResults').on('click', 'li', function () {
    const _id = $(this).data('variant-ref');
    const name = $(this).data('variant-name');
    const price = $(this).data('variant-price');
    const img = $(this).data('variant-img');

    const existingRow = $(`#list-items tr[data-variant-ref="${_id}"]`);
    if (existingRow.length > 0) {
        const currentQuantity = parseInt(existingRow.find('.quan').text());
        existingRow.find('.quan').text(currentQuantity + 1);
        updateAmount(existingRow);
    } else {
        const newRow = `
        <tr data-variant-ref="${_id}">
            <td>
                <div class="d-flex align-items-center">
                    <img src="${img}" alt="${_id}">
                    <h6 class="text-md ms-3">${name}</h6>
                </div>
            </td>
            <td class="price text-end text-sm pe-4">${currency(price * 1000)}</td>
            <td class="text-center text-md">
                <span class="dec-quan btn badge bg-gradient-danger m-0">–</span>
                <span class="quan badge bg-gradient-light text-dark">1</span>
                <span class="inc-quan btn badge bg-gradient-success m-0">+</span>
            </td>
            <td class="amount text-end text-sm pe-4">${currency(price * 1000)}</td>
            <td>
                <a class="delete">
                    <i class="far fa-trash-alt text-danger text-gradient" aria-hidden="true"></i>
                </a>
            </td>
        </tr>`;

        $('#list-items').append(newRow);
        updateTotal();
    }

    $('#variantValue').val('');
    $('#searchResults').empty().hide();
});

// Quantity on Product
$('#list-items').on('click', '.dec-quan', function () {
    const sltQuan = $(this).closest('tr').find('.quan');
    let currentQuantity = parseInt(sltQuan.text());

    if (currentQuantity > 0) {
        currentQuantity--;
        sltQuan.text(currentQuantity);
        updateAmount(this);
    } else {
        $(this).closest('tr').remove();
    }
});

$('#list-items').on('click', '.inc-quan', function () {
    const sltQuan = $(this).closest('tr').find('.quan');
    let currentQuantity = parseInt(sltQuan.text());

    currentQuantity++;
    sltQuan.text(currentQuantity);
    updateAmount(this);
});

$('#list-items').on('click', '.delete', function () {
    $(this).closest('tr').remove();
    updateAmount(this);
})

// Amount on Product
function updateAmount(selector) {
    const row = $(selector).closest('tr');

    const price = number(row.find('.price').text());
    const quantity = parseInt(row.find('.quan').text());
    const amount = price * quantity;
    row.find('.amount').text(currency(amount));

    updateTotal();
}

function updateTotal() {
    let subTotal = 0;
    let totalAmount = 0;
    let totalItems = 0;
    const discount = number($('#discount').val());

    $('#list-items tr').each(function () {
        const amount = number($(this).find('.amount').text()) || 0;
        const quantity = parseInt($(this).find('.quan').text()) || 0;
        subTotal += amount;
        totalItems += quantity;
    });

    totalAmount = Math.max(subTotal - discount, 0);

    $('.totalItems').text(totalItems);
    $('#subTotal').val(currency(subTotal));
    $('#totalAmount').val(currency(totalAmount));
}

// Payment
function openPaymentModal() {
    $('#list-items tr').filter(function () {
        return parseInt($(this).find('.quan').text()) === 0;
    }).remove();

    const totalAmount = number($('#totalAmount').val()) || 0;
    $('#totalPayable').text(currency(totalAmount));
    $('#totalPaying').text(currency(totalAmount));
    $('#receive').val(totalAmount / 1000);
    updateChange();

    $('#paymentModal').modal('show');
}

$('.amount-item').on('click', function () {
    const amount = parseInt($(this).data('amount')) || 0;

    let currentCount = parseInt($(this).find('span').text()) || 0;
    $(this).find('span').text(currentCount + 1).show();

    updateValues(amount);
});

function updateValues(amount) {
    const currentReceive = parseInt($('#receive').val()) || 0;
    const currentTotalPaying = number($('#totalPaying').text()) || 0;

    const newReceive = currentReceive + amount;
    const newTotalPaying = currentTotalPaying + amount * 1000;

    $('#receive').val(newReceive);
    $('#totalPaying').text(currency(newTotalPaying));

    updateChange();
}

function updateChange() {
    const totalPaying = number($('#totalPaying').text()) || 0;
    const totalPayable = number($('#totalPayable').text()) || 0;

    const change = totalPaying - totalPayable;

    $('#orderBtn').prop('disabled', true);
    if (change >= 0) {
        $('#orderBtn').prop('disabled', false);
    }

    $('#change').text(currency(change));
}

function clearValues() {
    $('#receive').val('0');
    $('#totalPaying').text('0');
    $('.amount-item span').text('0').hide();
    updateChange();
}

$('#receive').on('input', function () {
    let inputValue = $(this).val().replace(/[^0-9]/g, '');

    $(this).val(inputValue);

    $('#totalPaying').text(currency(inputValue * 1000));
    updateChange();
});

// Create Order
function createOrder() {
    const items = [];
    $('#list-items tr').each(function () {
        items.push({
            variant: $(this).data('variant-ref'),
            price: number($(this).find('.price').text()) / 1000,
            quantity: number($(this).find('.quan').text()),
            amount: number($(this).find('.amount').text()) / 1000
        })
    })

    const data = {
        customer: $('#customerId').val(),
        summaryAmount: {
            subTotal: number($('#subTotal').val()) / 1000,
            discount: number($('#discount').val()) / 1000,
            voucher: number($('#voucher').val()) / 1000,
            totalAmount: number($('#totalAmount').val()) / 1000
        },
        items: items,
        payment: {
            method: $('#method').val(),
            receive: number($('#totalPaying').text()) / 1000,
            change: number($('#change').text()) / 1000,
            type: $('#type').val(),
            remainAmount: 0
        }
    }
    if (data.customer === '') {
        delete data.customer;
    }

    $.ajax({
        url: '/order/create',
        method: 'POST',
        dataType: 'json',
        data: data,
        success: function (response) {
            if (response.success) {
                window.location.href = `/order/invoice/${response.order.Id}`
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
        }
    });
}

// Customer
$('#cancel-customer').click(function () {
    $('#customerId').val('');
    $('#customer').val('').prop('disabled', false);
    $('#regist-customer').show();
    $(this).hide();
})

$('#name, #phone').on('focus', function () {
    $(this).removeClass('is-invalid');
})

function registerCustomer() {
    const name = $('#name').val().trim();
    const phone = $('#phone').val().trim();

    $.ajax({
        url: '/customer/register',
        method: 'POST',
        dataType: 'json',
        data: { name, phone },
        success: function (response) {
            if (response.success) {
                const customer = response.customer;

                $('#customerId').val(customer.Id);
                $('#customer').val(`(${customer.Id}) ${customer.name}`).prop('disabled', true);
                $('#cancel-customer').show();
                $('#regist-customer').hide();

                $('#modal-created-title').text(response.title);
                $('#modal-created-msg').text(response.message);
                $('#registModal').modal('hide');
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
        }
    });
}

$('#registModal').on('hidden.bs.modal', function () {
    $('#name').val('').removeClass('is-invalid');
    $('#phone').removeClass('is-invalid');
});

$('#customer').on('input', function () {
    const searchTerm = $(this).val().trim();

    if (searchTerm !== '') {
        $.ajax({
            url: 'customer/search',
            method: 'POST',
            dataType: 'json',
            data: { searchTerm: searchTerm },
            success: function (data) {
                displaySearchCustomer(data);
            },
            error: function (error) {
                console.error('Error fetching search results:', error);
            }
        });
    } else {
        $('#searchCustomer').empty().hide();
    }
})

function displaySearchCustomer(results) {
    $('#searchCustomer').empty().show();

    if (results.length > 0) {
        results.forEach(function (result) {
            const resultText = `(${result.Id}) ${result.name} - ${result.phone} `;
            const listItem = `
                <li data-customer-id="${result.Id}" data-customer-name="${result.name}"
                    data-customer-phone="${result.phone}" data-customer-discount="${result.discount}">
                    <a class="dropdown-item">${resultText}</a>
                </li>`;
            $('#searchCustomer').append(listItem);
        });
    } else {
        $('#searchCustomer').append('<li><a class="dropdown-item">No results found</a></li>');
    }
}

$('#searchCustomer').on('click', 'li', function () {
    const Id = $(this).data('customer-id');
    const name = $(this).data('customer-name');
    const phone = $(this).data('customer-phone');
    const discount = $(this).data('customer-discount');

    $('#customerId').val(Id);
    $('#customer').val(`(${Id}) ${name}`).prop('disabled', true);
    $('#cancel-customer').show();
    $('#regist-customer').hide();

    $('#discount').val(currency(discount * 1000));
    updateTotal();

    $('#searchCustomer').empty().hide();
});

// Utils
$('#total').on('DOMSubtreeModified', function () {
    const itemCount = number($(this).text());
    $('#paymentBtn').prop('disabled', itemCount === 0);
});

$('#paymentModal').on('hidden.bs.modal', function () {
    clearValues();
});

function currency(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function number(currency) {
    return parseInt(currency.replace(/,/g, ''));
}