const productId = new URLSearchParams(window.location.search).get('id');

$(document).ready(function () {
    $.ajax({
        url: '/category/getAll',
        method: 'POST',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                fillCategory(response.categories);
            }
        },
        error: function (xhr, status, error) {
            let msg = '';
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

    $.ajax({
        url: '/product/get',
        method: 'POST',
        dataType: 'json',
        data: { productId },
        success: function (response) {
            if (response.success) {
                const product = response.product;

                $('#name').val(product.name);
                $('#category option').each(function () {
                    if ($(this).val() === product.category._id) {
                        $(this).prop('selected', true);
                    } else {
                        $(this).prop('selected', false);
                    }
                });
                fillSpecs(product.category.specs, product.specs);
                displayVariants(product.variants);
            }
        },
        error: function (xhr, status, error) {
            let msg = '';
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

$('#name').on('focus', () => {
    $('#name').removeClass('is-invalid');
})

function fillCategory(data) {
    const dropdown = $('#category');
    dropdown.html(data.map(item => `<option value="${item._id}">${item.name}</option>`).join(''));

    dropdown.change(function () {
        const selectedCategoryId = $(this).val();

        const selectedCategory = data.find(item => item._id === selectedCategoryId);
        const categorySpecs = selectedCategory.specs;

        fillSpecs(categorySpecs);
    });
}

function fillSpecs(categorySpecs, productSpecs) {
    const dropdown = $('#specs-list');
    dropdown.empty();

    categorySpecs.forEach((categorySpec, index) => {
        let options;
        if (productSpecs) {
            const selectedProductSpec = productSpecs.find(productSpec => productSpec.name === categorySpec.name);
            options = categorySpec.options.map(option => {
                const isSelected = selectedProductSpec && selectedProductSpec.option === option;
                return `<option value="${option}" ${isSelected ? 'selected' : ''}>${option}</option>`;
            }).join('');
        } else {
            options = categorySpec.options.map(option => {
                return `<option value="${option}">${option}</option>`;
            }).join('');
        }

        dropdown.append(`
            <div class="specs col-lg-3 mt-4">
                <label for="${index}">${categorySpec.name}</label>
                <div class="choices" data-type="select-one">
                    <select id="${index}" class="form-control">${options}</select>
                </div>
            </div>
        `);
    });
}

function displayVariants(variants) {
    const variantsList = $('#variants-list');
    variantsList.empty();

    if (variants.length > 0) {
        variants.forEach(variant => {
            const variantItem = `
                <li class="list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg">
                    <div class="row w-100">
                        <div class="col-3 d-flex flex-column align-items-center">
                            <span class="badge ${getBadgeClass(variant.status, 'status')} badge-sm mb-2">${variant.status}</span>
                            <img class="product-img text-center" src="/uploads/product_variants/${variant.img !== 'default.png' ? `${productId}/` : ''}${variant.img}">
                        </div>
                        <div class="col-12 col-sm-9 d-flex flex-column">
                            <h6 class="mt-3 mt-sm-0 mb-3 text-sm">${variant.barcode}</h6>
                            <div class="row">
                                <span class="col-6 mb-2 text-xs">Color:
                                    <span class="text-dark font-weight-bold ms-sm-2">${variant.color}</span>
                                </span>
                                <span class="col-6 mb-2 text-xs">Quantity:
                                    <span class="text-dark font-weight-bold ms-sm-2">${variant.quantity}</span>
                                </span>
                                <span class="col-6 mb-2 text-xs">Cost:&nbsp;
                                    <span class="text-dark font-weight-bold ms-sm-2">${formatCurrency(variant.cost)}</span>
                                </span>
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
                    <div class="row ms-auto text-end w-sm-35 w-20" style="height: fit-content">
                        <a class="col-lg-6 edit btn btn-link m-0 ps-0 text-dark" data-barcode=${variant.barcode}>
                            <i class="fas fa-pencil-alt text-dark me-2" aria-hidden="true"></i>
                            Edit
                        </a>
                        <a class="col-lg-6 delete btn btn-link m-0 ps-0 text-danger text-gradient" data-barcode=${variant.barcode}>
                            <i class="far fa-trash-alt me-2" aria-hidden="true"></i>
                            Delete
                        </a>
                        <a class="col-lg-6 time btn btn-link m-0 ps-0 text-warning text-gradient" data-barcode=${variant.barcode}>
                            <i class="fas fa-history text-primary me-2" aria-hidden="true"></i>
                            Time
                        </a>
                        <a class="col-lg-6 detail btn btn-link m-0 ps-0 text-primary text-gradient" data-barcode=${variant.barcode}>
                            <i class="fas fa-eye text-primary me-2" aria-hidden="true"></i>
                            Detail
                        </a>
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

// Edit Product
function updateProduct() {
    const categoryId = $('#category').val();
    const name = $('#name').val();
    const specs = [];
    $('#specs-list .specs').each(function () {
        const specName = $(this).find('label').text().trim();
        const specOption = $(this).find('select').val();

        const spec = {
            name: specName,
            option: specOption
        };

        specs.push(spec);
    });

    $.ajax({
        url: '/product/update',
        method: 'PUT',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ productId, categoryId, name, specs }),
        success: function (response) {
            if (response.success) {
                $('#btn-ok-reload').hide();
                $('#btn-ok-noreload').show();

                $('#modal-success-title').text(response.title);
                $('#modal-success-msg').text(response.message);
                $('#successModal').modal('show');
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

// Add Variant
function displayVarAdd() {
    $('#varTittle').text("New Variant");
    $('#auto').prop('checked', true);
    $('#custom').prop('checked', false);
    $('#barcode').prop('disabled', true);
    $('#addBtn').show();
    $('#editBtn').hide();
    autoBarcode();
    $('#removeImg').click(() => {
        $('#preview').attr('src', '/uploads/product_variants/default.png');
        $('#img').val('');
    });
    $('#varModal').modal('show');
}

function addVariant() {
    const barcode = $('#barcode').val();
    const color = $('#color').val();
    const quantity = $('#quantity').val();
    const warn = $('#warn').val();
    const cost = $('#cost').val();
    const price = $('#price').val();

    const data = { productId, barcode, color, warn, cost, price, quantity };
    removeEmptyProperties(data);

    $('#btn-ok-reload').show();
    $('#btn-ok-noreload').hide();

    $.ajax({
        url: '/variant/create',
        method: 'POST',
        dataType: 'json',
        data: data,
        success: function (response) {
            if (response.success) {
                $('#modal-success-title').text(response.title);
                if ($('#img')[0].files.length > 0) {
                    uploadImg(response.variant.barcode, productId);
                } else {
                    $('#modal-success-msg').html('Variant created successfully with <b class="text-warning text-gradient">Default image</b>.');
                    $('#successModal').modal('show');
                }
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

// Handler
$('#variants-list').on('click', '.detail, .edit, .delete, .time, .status', function () {
    const barcode = $(this).data("barcode");

    const clickedElement = this;

    $.ajax({
        url: '/variant/getByBarcode',
        method: 'POST',
        dataType: 'json',
        data: { barcode },
        success: function (response) {
            if (response.success) {
                const variant = response.variant;

                switch (true) {
                    case $(clickedElement).hasClass('detail'):
                        displayVarDetail(variant);
                        break;

                    case $(clickedElement).hasClass('edit'):
                        localStorage.setItem('selectedBarcode', variant.barcode);
                        displayVarEdit(variant);
                        break;

                    case $(clickedElement).hasClass('delete'):
                        $('.current-var').text(`(${variant.barcode})`);
                        $('#delete-var-barcode').val(variant.barcode);
                        $('#deleteVarModal').modal('show');
                        break;

                    case $(clickedElement).hasClass('status'):
                        displayVarActived(variant);
                        break;

                    case $(clickedElement).hasClass('time'):
                        $('.current-var').text(`${variant.barcode}`);
                        $('#timelineModal').modal('show');
                        break;

                    default:
                        break;
                }
            }
        },
        error: function (xhr, status, error) {
            let msg = '';
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

// Active/Unactive Variant
function displayVarActived(variant) {
    $('.current-var').text(`(${variant.barcode})`);
    if (variant.actived) {
        $('#unactive-status').show();
        $('#active-status').hide();
    } else {
        $('#unactive-status').hide();
        $('#active-status').show();
    }
    $('#actived-var-barcode').val(variant.barcode);
    $('#activedValue').val(!variant.actived);
    $('#toggleActiveModal').modal('show');
}

function changeVarActived() {
    const data = {
        selectedBarcode: $('#actived-var-barcode').val(),
        actived: $('#activedValue').val() === 'false' ? false : true
    };

    $.ajax({
        url: '/variant/update',
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

// Detail Variant
function displayVarDetail(variant) {
    const img = `/uploads/product_variants/${variant.img !== 'default.png' ? `${productId}/` : ''}${variant.img}`;
    $('#detail-img-variant').attr('src', img);
    $('#detail-barcode-variant').text(variant.barcode);
    $('#detail-color-variant').text(variant.color);
    $('#detail-cost-variant').text(variant.cost);
    $('#detail-price-variant').text(variant.price);
    $('#detail-quantity-variant').text(variant.quantity);
    $('#detail-warn-variant').text(variant.warn);
    $('#detail-status-variant').text(`${variant.actived ? 'actived' : 'unactived'}`).removeClass().addClass(`pt-2 badge badge-sm ${getBadgeClass(variant.actived, 'actived')}`);
    $('#detail-created-variant').text(`${formatDateTime(variant.created.datetime)} by ${variant.created.name} (${variant.created.Id})`);

    if (variant.updated.length > 0) {
        variant.updated.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
        const latestUpdate = variant.updated[0];
        $('#detail-updated-variant').text(`${formatDateTime(latestUpdate.datetime)} by ${latestUpdate.name} (${latestUpdate.Id})`);
    } else {
        $('#detail-updated-variant').text("Nothing");
    }

    $('#detailModal').modal('show');
}

// Edit Variant
function displayVarEdit(variant) {
    $('#auto').prop('checked', false);
    $('#custom').prop('checked', true);
    $('#varTittle').text(`Edit Variant ${variant.barcode}`);
    $('#barcode').val(variant.barcode).prop('disabled', false);
    $('#color').val(variant.color);
    $('#quantity').val(variant.quantity);
    $('#warn').val(variant.warn);
    $('#cost').val(variant.cost);
    $('#price').val(variant.price);
    const img = `/uploads/product_variants/${variant.img !== 'default.png' ? `${productId}/` : ''}${variant.img}`;
    $('#preview').attr('src', img);
    $('#addBtn').hide();
    $('#editBtn').show();
    $('#removeImg').click(() => {
        $('#preview').attr('src', img);
        $('#img').val('');
    });
    $('#varModal').modal('show');
}

function editVariant() {
    const selectedBarcode = localStorage.getItem('selectedBarcode');
    if (selectedBarcode) {
        const barcode = $('#barcode').val();
        const color = $('#color').val();
        const quantity = $('#quantity').val();
        const warn = $('#warn').val();
        const cost = $('#cost').val();
        const price = $('#price').val();

        const data = { selectedBarcode, barcode, color, warn, cost, price, quantity };
        removeEmptyProperties(data);

        $('#btn-ok-reload').show();
        $('#btn-ok-noreload').hide();

        $.ajax({
            url: '/variant/update',
            method: 'PUT',
            dataType: 'json',
            data: data,
            success: function (response) {
                if (response.success) {
                    $('#modal-success-title').text(response.title);
                    localStorage.setItem('selectedBarcode', response.variant.barcode);
                    localStorage.setItem('updated', JSON.stringify({ success: true, message: response.message }));
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
                localStorage.setItem('updated', JSON.stringify({ success: false, message: msg }));
            },
            complete: function () {
                if ($('#img')[0].files.length > 0) {
                    uploadImg(localStorage.getItem('selectedBarcode'), productId);
                } else {
                    const updated = JSON.parse(localStorage.getItem('updated'));
                    if (updated.success) {
                        $('#modal-success-msg').text(updated.message);
                        $('#successModal').modal('show');
                    } else {
                        $('#message-modal-fail').html(updated.message);
                        $('#failModal').modal('show');
                    }
                }
            }
        });
    } else {
        $('#message-modal-fail').html('No variation is selected. Please try again.');
        $('#failModal').modal('show');
    }
}

// Delete Variant
function confirmDel() {
    const barcode = $('#delete-var-barcode').val();
    const listItem = $(`[data-barcode="${barcode}"]`).closest('li');

    $.ajax({
        url: '/variant/remove',
        method: 'DELETE',
        dataType: 'json',
        data: { barcode },
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
function uploadImg(barcode, productId) {
    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('barcode', barcode);
    formData.append('img', $('#img')[0].files[0]);

    if ($('#img')[0].files.length > 0) {
        $.ajax({
            url: '/variant/uploadImg',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.success) {
                    const selectedBarcode = localStorage.getItem('selectedBarcode');
                    if (selectedBarcode) {
                        $('#modal-success-msg').text('Variant updated & Image uploaded successfully.');
                    } else {
                        $('#modal-success-msg').text('Variant created & Image uploaded successfully.');
                    }
                    $('#successModal').modal('show');
                }
            },
            error: function (error) {
                const selectedBarcode = localStorage.getItem('selectedBarcode');
                if (selectedBarcode) {
                    $('#modal-success-msg').html('Variant updated successfully but <b class="text-danger text-gradient">Image upload fail</b>.');
                } else {
                    $('#modal-success-msg').html('Variant created successfully but <b class="text-danger text-gradient">Image upload fail</b>.');
                }
                $('#successModal').modal('show');
            }
        });
    } else {
        $('#message-modal-fail').html('No image is selected. Please try again.');
        $('#failModal').modal('show');
    }
}

$('#varModal').on('hidden.bs.modal', function () {
    $('#auto').prop('checked', true);
    $('#custom').prop('checked', false);
    $('#barcode').prop('disabled', true).removeClass('is-invalid');
    $('#color').val('').removeClass('is-invalid');
    $('#quantity').removeClass('is-invalid');
    $('#warn').val('').removeClass('is-invalid');
    $('#cost').val('').removeClass('is-invalid');
    $('#price').val('').removeClass('is-invalid');
    $('#preview').attr('src', "/uploads/product_variants/default.png");
    $('#img').val('');
    localStorage.removeItem('selectedBarcode');
});

$('input[name="typeBarcode"]').change(function () {
    if ($('#auto').is(':checked')) {
        $('#barcode').prop('disabled', true);
        autoBarcode();
    } else if ($('#custom').is(':checked')) {
        $('#barcode').prop('disabled', false);
        const selectedBarcode = localStorage.getItem('selectedBarcode');
        if (selectedBarcode) {
            $('#barcode').val(selectedBarcode);
        }
    }
});

function autoBarcode() {
    let barcode = '';
    barcode += $('#category option:selected').text().substring(0, 1);
    const partsName = $('#name').val().split(' ') || '';
    partsName.forEach(part => {
        barcode += part.substring(0, 2);
    })
    barcode += $('#color').val().substring(0, 3) || '';
    $('#barcode').val(barcode.toUpperCase());
}

function chooseImg() {
    $('#img').click();
}

$('#color').on('input', function () {
    if ($('#auto').is(':checked')) {
        autoBarcode();
    }
});

$('#img').on('change', function () {
    const fileInput = $(this)[0];
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            $('#preview').attr('src', e.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
});

$('#barcode, #color, #quantity, #warn, #cost, #price').on('focus', function () {
    $(this).removeClass('is-invalid');
});

function removeEmptyProperties(obj) {
    for (const key in obj) {
        if (obj[key] === '' || obj[key] === undefined) {
            delete obj[key];
        }
    }
}

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