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
    const categoryId = $(this).data("id");

    const clickedElement = this;

    $.ajax({
        url: '/category/get',
        method: 'POST',
        dataType: 'json',
        data: { categoryId },
        success: function (response) {
            if (response.success) {
                const category = response.category;

                switch (true) {
                    case $(clickedElement).hasClass('detail'):
                        displayCategoryDetail(category);
                        break;

                    case $(clickedElement).hasClass('delete'):
                        $('.current-cate').text(`(${category.name})`);
                        $('#delete-category-id').val(category._id);
                        $('#deleteModal').modal('show');
                        break;

                    case $(clickedElement).hasClass('cannot-delete'):
                        $('#message-modal-fail').text('Cannot delete. There are products associated with it.');
                        $('#failModal').modal('show');
                        break;

                    case $(clickedElement).hasClass('status'):
                        displayCategoryActived(category);
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

// Active/Unactive Cate
function displayCategoryActived(category) {
    $('.current-cate').text(`(${category.name})`);
    if (category.actived) {
        $('#unactive-status').show();
        $('#active-status').hide();
    } else {
        $('#unactive-status').hide();
        $('#active-status').show();
    }
    $('#actived-cate-id').val(category._id);
    $('#activedValue').val(!category.actived);
    $('#toggleActiveModal').modal('show');
}

function changeCategoryActived() {
    const data = {
        categoryId: $('#actived-cate-id').val(),
        actived: $('#activedValue').val() === 'false' ? false : true
    };

    $.ajax({
        url: '/category/update',
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

// Detail
function displayCategoryDetail(category) {
    $('#detail-name-category').text(category.name);
    $('#detail-status-category').text(`${category.actived ? 'actived' : 'unactived'}`).removeClass().addClass(`pt-2 badge badge-sm ${getBadgeClass(category.actived)}`);
    $('#detail-created-category').text(`${formatDateTime(category.created.datetime)} by ${category.created.name} (${category.created.Id})`);

    $('#detail-specs-category').empty();
    if (category.specs.length > 0) {
        category.specs.forEach(spec => {
            const row = $('<p class="mb-1">');
            row.append(`<span>${spec.name}: </span>`);
            spec.options.forEach(option => {
                const rowOption = $('<span>');
                rowOption.append(option + ' | ');
                row.append(rowOption);
            })
            $('#detail-specs-category').append(row);
        });
    } else {
        $('#detail-specs-category').append(`
            <div class="alert alert-light m-0 p-2 text-md" role="alert">
                <strong>Ooops!</strong> There aren't any specifications yet!
            </div>
        `);
    }

    if (category.updated.length > 0) {
        category.updated.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
        const latestUpdate = category.updated[0];
        $('#detail-updated-category').text(`${formatDateTime(latestUpdate.datetime)} by ${latestUpdate.name} (${latestUpdate.Id})`);
    } else {
        $('#detail-updated-category').text("Nothing");
    }

    $('#detailModal').modal('show');
}

// Delete
function confirmDel() {
    const categoryId = $('#delete-category-id').val();
    const listItem = $(`[data-id="${categoryId}"]`).closest('tr');

    $.ajax({
        url: '/category/remove',
        method: 'DELETE',
        dataType: 'json',
        data: { categoryId },
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
function getBadgeClass(value) {
    switch (value) {
        case true:
            return 'bg-gradient-success';
        case false:
            return 'bg-gradient-secondary';
        default:
            return 'badge-secondary';
    }
}

function formatDateTime(dateString) {
    const options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', options);
}