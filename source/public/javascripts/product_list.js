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
$('tbody').on('click', '.detail, .delete, .cannot-delete, .status', function () {
    const productId = $(this).data("id");

    const clickedElement = this;

    $.ajax({
        url: '/product/get',
        method: 'POST',
        dataType: 'json',
        data: { productId },
        success: function (response) {
            if (response.success) {
                const product = response.product;

                switch (true) {
                    case $(clickedElement).hasClass('detail'):
                        displayProductDetail(product);
                        break;

                    case $(clickedElement).hasClass('delete'):
                        $('.current-product').text(`(${product.name})`);
                        $('#delete-product-id').val(product._id);
                        $('#deleteModal').modal('show');
                        break;

                    case $(clickedElement).hasClass('cannot-delete'):
                        $('#message-modal-fail').text('Cannot delete. There are products associated with it.');
                        $('#failModal').modal('show');
                        break;

                    case $(clickedElement).hasClass('status'):
                        displayProductActived(product);
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

// Detail
function displayProductDetail(product) {
    $('#detail-cate-product').text(product.category.name);
    $('#detail-name-product').text(product.name);
    $('#detail-status-product').text(`${product.actived ? 'actived' : 'unactived'}`).removeClass().addClass(`pt-2 badge badge-sm ${getBadgeClass(product.actived, 'actived')}`);
    $('#detail-created-product').text(`${formatDateTime(product.created.datetime)} by ${product.created.name} (${product.created.Id})`);

    $('#detail-specs-product').empty();
    if (product.specs.length > 0) {
        product.specs.forEach(spec => {
            const row = $('<p class="mb-1">');
            row.append(`<span>${spec.name}: ${spec.option}</span>`);
            $('#detail-specs-product').append(row);
        });
    } else {
        $('#detail-specs-product').append(`
            <div class="alert alert-light m-0 p-2 text-md" role="alert">
                <strong>Ooops!</strong> There aren't any specifications yet!
            </div>
        `);
    }

    if (product.updated.length > 0) {
        product.updated.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
        const latestUpdate = product.updated[0];
        $('#detail-updated-product').text(`${formatDateTime(latestUpdate.datetime)} by ${latestUpdate.name} (${latestUpdate.Id})`);
    } else {
        $('#detail-updated-product').text("Nothing");
    }

    displayVariants(product.variants, product._id);
    $('#detailModal').modal('show');
}

function displayVariants(variants, productId) {
    const variantsList = $('#variants-list');
    variantsList.empty();

    if (variants.length > 0) {
        variants.forEach(variant => {
            let costRender = '';
            if (variant.cost !== undefined) {
                costRender = `
                    <span class="col-6 mb-2 text-xs">Cost:&nbsp;
                        <span class="text-dark font-weight-bold ms-sm-2">${formatCurrency(variant.cost)}</span>
                    </span>`;
            }

            const variantItem = `
                <li class="list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg">
                    <div class="row w-100">
                        <div class="col-3 mb-sm-3 d-flex flex-column align-items-center justify-content-center">
                            <span class="mb-2 badge ${getBadgeClass(variant.status, 'status')} badge-sm">${variant.status}</span>
                            <img class="product-img text-center" src="/uploads/product_variants/${variant.img !== 'default.png' ? `${productId}/` : ''}${variant.img}">
                        </div>
                        <div class="col-9 d-flex flex-column">
                            <h6 class="mt-3 mt-sm-0 mb-3 text-sm">${variant.barcode}</h6>
                            <div class="row">
                                <span class="col-6 mb-2 text-xs">Color:
                                    <span class="text-dark font-weight-bold ms-sm-2">${variant.color}</span>
                                </span>
                                <span class="col-6 mb-2 text-xs">Quantity:
                                    <span class="text-dark font-weight-bold ms-sm-2">${variant.quantity}</span>
                                </span>
                                ${costRender}
                                <span class="col-6 mb-2 text-xs">Warn:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    <span class="text-dark font-weight-bold ms-sm-2">${variant.warn}</span>
                                </span>
                                <span class="col-6 mb-2 text-xs">Price:
                                    <span class="text-dark font-weight-bold ms-sm-2">${formatCurrency(variant.price)}</span>
                                </span>
                                <span class="col-6 mb-2 text-xs">Status:&nbsp;
                                    <span data-barcode=${variant.barcode} class="btn status badge badge-sm ${getBadgeClass(variant.actived, 'actived')}">${variant.actived ? 'actived' : 'unactived'}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </li>`;

            variantsList.append(variantItem);
        });
    } else {
        const noVariantMessage = `
            <div class="alert alert-light m-0" role="alert">
                <strong>Ooops!</strong> There aren't any product variants yet!
            </div>`;

        variantsList.append(noVariantMessage);
    }
}

// Active/Unactive Product
function displayProductActived(product) {
    $('.current-product').text(`(${product.name})`);
    if (product.actived) {
        $('#unactive-status').show();
        $('#active-status').hide();
    } else {
        $('#unactive-status').hide();
        $('#active-status').show();
    }
    $('#actived-product-id').val(product._id);
    $('#activedValue').val(!product.actived);
    $('#toggleActiveModal').modal('show');
}

function changeProductActived() {
    const data = {
        productId: $('#actived-product-id').val(),
        actived: $('#activedValue').val() === 'false' ? false : true
    };

    $.ajax({
        url: '/product/update',
        method: 'PUT',
        dataType: 'json',
        data: data,
        success: function (response) {
            if (response.success) {
                $('#btn-ok-reload').show();
                $('#btn-ok-noreload').hide();

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

// Delete
function confirmDel() {
    const productId = $('#delete-product-id').val();
    const listItem = $(`[data-id="${productId}"]`).closest('tr');

    $.ajax({
        url: '/product/remove',
        method: 'DELETE',
        dataType: 'json',
        data: { productId },
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

// Utils
function getBadgeClass(value, condition) {
    switch (condition) {
        case 'actived':
            return value ? 'bg-gradient-success' : 'bg-gradient-secondary';
        case 'status':
            return value === 'new' ? 'badge-primary' : (value === 'in stock' ? 'badge-success' : (value === 'warning' ? 'badge-warning' : (value === 'out of stock' ? 'badge-danger' : 'badge-secondary')));
        default:
            return 'badge-secondary';
    }
}

function formatDateTime(dateString) {
    const options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', options);
}

function formatCurrency(input) {
    if (isNaN(input)) {
        return "Invalid input";
    }
    const formattedCurrency = (input * 1000).toLocaleString('en-US');
    return formattedCurrency + " VND";
}