$('#edit-name-cate').click(() => {
    const status = $('#name').prop('disabled');
    $('#name').prop('disabled', !status);
});

$('#name').on('blur', () => {
    const categoryId = $('#categoryId').val();
    const newName = $('#name').val();

    $.ajax({
        url: '/category/update',
        method: 'PUT',
        dataType: 'json',
        data: {
            categoryId: categoryId,
            name: newName
        },
        success: function (response) {
            $('#btn-ok-reload').hide();
            $('#btn-ok-noreload').show();
            $('#name').prop('disabled', true);

            $('#modal-success-title').text(response.title);
            $('#modal-success-msg').text(response.message);
            $('#successModal').modal('show');
        },
        error: function (xhr, textStatus, errorThrown) {
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
});

$('#specs-list').on('click', '.edit, .delete', function () {
    const categoryId = $('#categoryId').val();
    const specId = $(this).data("id");

    const clickedElement = this;

    $.ajax({
        url: '/category/getSpec',
        method: 'POST',
        dataType: 'json',
        data: { categoryId, specId },
        success: function (response) {
            if (response.success) {
                const spec = response.spec;

                switch (true) {
                    case $(clickedElement).hasClass('edit'):
                        displaySpecEdit(spec);
                        break;

                    case $(clickedElement).hasClass('delete'):
                        $('.current-spec').text(`(${spec.name})`);
                        $('#delete-spec-id').val(spec._id);
                        $('#deleteSpecModal').modal('show');
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

function addOptionField(type) {
    $(`#${type}-options-area`).append(`
        <div class="col-6 col-lg-4 mb-3 options-container">
            <div class="d-flex">
                <input class="form-control options ${type}" type="text">
                <a href="" class="input-group-text delete-options">
                    <i class="fas fa-minus text-danger"></i>
                </a>
            </div>
        </div>`);
}

$('.modal').on('click', '.delete-options', function (e) {
    e.preventDefault();
    $(this).closest('.options-container').remove();
});

// Add
function addSpec() {
    const categoryId = $('#categoryId').val();
    const name = $('#spec-name').val();

    const options = [];
    $('.options.add').each(function () {
        const optionValue = $(this).val();
        if (optionValue.trim() !== '') {
            options.push(optionValue);
        }
    });

    $.ajax({
        url: '/category/addSpecs',
        method: 'POST',
        dataType: 'json',
        data: { categoryId, name, options },
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

// Edit
function displaySpecEdit(spec) {
    $('#edit-spec-id').val(spec._id);
    $('#edit-spec-name').val(spec.name);

    const area = $('#edit-options-area');
    area.empty();

    spec.options.forEach(opt => {
        area.append(`
            <div class="col-6 col-lg-4 mb-3 options-container">
                <div class="d-flex">
                    <input class="form-control options edit" type="text" value="${opt}">
                    <a href="" class="input-group-text delete-options">
                        <i class="fas fa-minus text-danger"></i>
                    </a>
                </div>
            </div>`);
    })

    $('#editSpecModal').modal('show');
}

function editSpec() {
    const categoryId = $('#categoryId').val();
    const specId = $('#edit-spec-id').val();
    const name = $('#edit-spec-name').val();

    const options = [];
    $('.options.edit').each(function () {
        const optionValue = $(this).val();
        if (optionValue.trim() !== '') {
            options.push(optionValue);
        }
    });

    $.ajax({
        url: '/category/updateSpecs',
        method: 'PUT',
        dataType: 'json',
        data: { categoryId, specId, name, options },
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

// Delete
function confirmDel() {
    const categoryId = $('#categoryId').val();
    const specId = $('#delete-spec-id').val();
    const listItem = $(`[data-id="${specId}"]`).closest('li');

    $.ajax({
        url: '/category/removeSpecs',
        method: 'DELETE',
        dataType: 'json',
        data: { categoryId, specId },
        success: function (response) {
            if (response.success) {
                listItem.remove();
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