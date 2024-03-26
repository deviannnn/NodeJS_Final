function init() {
    $.ajax({
        url: '/account/getAll',
        method: 'POST',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                displayAccounts(response.accounts);
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
}

function displayAccounts(accounts) {
    const tableBody = $('tbody');
    tableBody.empty();

    accounts.forEach(account => {
        const row = $('<tr>');
        row.append(`
        <td>
            <div class="d-flex py-1">
                <div>
                    <img src="/uploads/accounts/${account.profile.avatar}" class="avatar avatar-sm me-3" ">
                </div>
                <div class="d-flex flex-column justify-content-center">
                    <h6 h6 class="mb-0 text-sm">${account.profile.name}</h6>
                    <p class="text-xs text-secondary mb-0">${account.gmail}</p>
                    </div>
            </div>
        </td>`);
        row.append(`
            <td>
                <span class="${account.actived ? '' : 'btn send'} badge badge-sm ${getBadgeClass(account.actived, 'status')}" data-id="${account.Id}">
                ${account.actived ? 'actived' : 'unactived'}</span>
            </td>`);
        row.append(`<td><span class="text-secondary text-xs font-weight-bold">${formatDate(account.created.datetime)}</span></td>`);
        row.append(`<td><span class="mt-3 btn lock badge badge-sm ${getBadgeClass(account.locked, 'locked')}" data-id="${account.Id}">${account.locked ? 'locked' : 'nolocked'}</span></td>`);
        row.append(`
            <td>
                <a class="action-btn detail" data-id="${account.Id}"><i class="fas fa-eye text-primary text-gradient" aria-hidden="true"></i></a>
                <a class="action-btn edit mx-3" data-id="${account.Id}"><i class="fas fa-user-edit text-dark text-gradient" aria-hidden="true"></i></a>
                <a class="action-btn delete" data-id="${account.Id}"><i class="far fa-trash-alt text-danger text-gradient" aria-hidden="true"></i></a>
            </td>`);

        tableBody.append(row);
    });

    $('#example2').DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": false,
        "ordering": true,
        "info": true,
        "autoWidth": false,
    });
}

// Handler
$('tbody').on('click', '.detail, .edit, .delete, .send, .lock', function () {
    const Id = $(this).data("id");

    const clickedElement = this;

    $.ajax({
        url: '/account/get',
        method: 'POST',
        dataType: 'json',
        data: { Id: Id },
        success: function (response) {
            if (response.success) {
                const account = response.account;

                switch (true) {
                    case $(clickedElement).hasClass('detail'):
                        displayAccountDetail(account);
                        break;

                    case $(clickedElement).hasClass('edit'):
                        displayAccountEdit(account);
                        break;

                    case $(clickedElement).hasClass('lock'):
                        displayAccountLock(account);
                        break;

                    case $(clickedElement).hasClass('send'):
                        $('.current-account').text(`${account.gmail}`);
                        $('#resendMailId').val(account.Id);
                        $('#resendMailModal').modal('show');
                        break;

                    case $(clickedElement).hasClass('delete'):
                        $('.current-account').text(`(${account.profile.name})`);
                        $('#deleteId').val(account.Id);
                        $('#deleteModal').modal('show');
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

// ResendMail module
$('#confirm-resend-btn').on('click', onConfirmResendMailClick);

function onConfirmResendMailClick() {
    const resendMailId = getValue('#resendMailId');

    $.ajax({
        url: '/account/resendMail',
        method: 'POST',
        dataType: 'json',
        data: { Id: resendMailId },
        beforeSend: function () {
            $('#loadingModal').modal('show');
        },
        success: function (response) {
            if (response.success) {
                $('#btn-ok-reload').hide();
                $('#btn-ok-noreload').show();

                $('#modal-success-title').text(response.title);
                $('#modal-success-msg').text(response.message);
                $('#successModal').modal('show');
            } else {
                $('#message-modal-fail').html(response.message);
                $('#failModal').modal('show');
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
            $('#message-modal-fail').html(msg);
            $('#failModal').modal('show');
        },
        complete: function () {
            setTimeout(function () {
                $('#loadingModal').modal('hide');
            }, 500);
        }
    });
}

// Delete module
$('#confirm-del-btn').on('click', onConfirmDelButtonClick);

function onConfirmDelButtonClick() {
    const deleteId = getValue('#deleteId');
    const listItem = $(`[data-id="${deleteId}"]`).closest('tr');

    $.ajax({
        url: '/account/remove',
        method: 'DELETE',
        dataType: 'json',
        data: { Id: deleteId },
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

// Lock/Unlock module
function displayAccountLock(account) {
    $('.lock-name').text(account.profile.name);
    $('.lock-gender').text(`${account.profile.gender === 'male' ? 'he' : 'she'}`);
    if (account.locked) {
        $('#unlock-status').show();
        $('#lock-status').hide();
    } else {
        $('#unlock-status').hide();
        $('#lock-status').show();
    }
    $('#lockedId').val(account.Id);
    $('#lockedValue').val(!account.locked);
    $('#toggleLockModal').modal('show');
}

$('#confirm-lock-btn').on('click', onConfirmLockButtonClick);

function onConfirmLockButtonClick() {
    const data = {
        Id: getValue('#lockedId'),
        locked: getValue('#lockedValue') === 'false' ? false : true
    };

    $.ajax({
        url: '/account/update',
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

// Detail module
function displayAccountDetail(account) {
    $('#detail-img-account').attr('src', `/uploads/accounts/${account.profile.avatar}`);
    $('#detail-id-account').text(account.Id);
    $('#detail-name-account').text(account.profile.name);
    $('#detail-gmail-account').text(account.gmail);
    $('#detail-phone-account').text(account.profile.phone);
    $('#detail-gender-account').text(account.profile.gender);
    $('#detail-birthday-account').text(formatDate(account.profile.birthday));
    $('#detail-address-account').text(`${account.profile.address.num} ${account.profile.address.street}, Ward ${account.profile.address.ward}, District ${account.profile.address.district}, ${account.profile.address.city} City.`);
    $('#detail-role-account').text(account.role).removeClass().addClass(`pt-2 badge badge-sm ${getBadgeClass(account.role, 'role')}`);
    $('#detail-status-account').text(`${account.actived ? 'actived' : 'unactived'}`).removeClass().addClass(`pt-2 badge badge-sm ${getBadgeClass(account.actived, 'status')}`);
    $('#detail-locked-account').text(`${account.locked ? 'locked' : 'nolock'}`).removeClass().addClass(`pt-2 badge badge-sm ${getBadgeClass(account.locked, 'locked')}`);
    $('#detail-created-account').text(`${formatDateTime(account.created.datetime)} by ${account.created.name} (${account.created.Id})`);

    if (account.updated.length > 0) {
        account.updated.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
        const latestUpdate = account.updated[0];
        $('#detail-updated-account').text(`${formatDateTime(latestUpdate.datetime)} by ${latestUpdate.name} (${latestUpdate.Id})`);
    } else {
        $('#detail-updated-account').text("Nothing");
    }

    $('#detailModal').modal('show');
}

// Edit module
function displayAccountEdit(account) {
    $('#Id').val(account.Id);
    $('#gender option').each(function () {
        if ($(this).val() === account.profile.gender) {
            $(this).prop('selected', true);
        } else {
            $(this).prop('selected', false);
        }
    });
    $('#name').val(account.profile.name);
    $('#gmail').val(account.gmail);
    $('#phone').val(account.profile.phone);
    $('#birthday').val(formatForBirthdayInput(account.profile.birthday));
    $('#num').val(account.profile.address.num);
    $('#street').val(account.profile.address.street);
    $('#ward').val(account.profile.address.ward);
    $('#district').val(account.profile.address.district);
    $('#city').val(account.profile.address.city);

    validateAllFields()
    $('#editModal').modal('show');
}

$('#confirm-edit-btn').on('click', onConfirmEditButtonClick);

$('#next-edit-btn').on('click', onNextEditButtonClick);

function onConfirmEditButtonClick() {
    const isValid = validateAllFields();
    if (isValid) {
        const data = {
            Id: getValue('#Id'),
            gmail: getValue('#gmail'),
            name: getValue('#name'),
            gender: getValue('#gender'),
            birthday: getValue('#birthday'),
            phone: getValue('#phone'),
            num: getValue('#num'),
            street: getValue('#street'),
            ward: getValue('#ward'),
            district: getValue('#district'),
            city: getValue('#city'),
        };

        $.ajax({
            url: '/account/update',
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
    } else {
        $('#message-modal-fail').text('Please correct invalid fields')
        $('#failModal').modal('show');
    }
}

function onNextEditButtonClick() {
    const isValid = validateAllFields();
    if (isValid) {
        $('#verifyEditModal').modal('show');
    } else {
        $('#message-modal-fail').text('Please correct invalid fields')
        $('#failModal').modal('show');
    }
}

$('#name, #gmail, #birthday, #phone, #num, #street, #ward, #district, #city').on('input', function () {
    validateInput($(this));
});

function validateAllFields() {
    const fields = ['#name', '#gmail', '#birthday', '#phone', '#num', '#street', '#ward', '#district', '#city'];
    let countError = 0;
    for (const field of fields) {
        const check = validateInput($(field));
        if (check === false) {
            countError++;
        }
    }
    if (countError > 0) {
        return false;
    }
    return true;
}

function validateInput(input) {
    const value = input.val().trim();

    const showError = (errId, errMsg) => {
        $(errId).text(errMsg).show();
        input.removeClass('is-valid').addClass('is-invalid');
        return false;
    };

    const showSuccess = (errId) => {
        $(errId).hide();
        input.removeClass('is-invalid').addClass('is-valid');
        return true;
    };

    if (input.is('#gmail')) {
        if (!/^\w+([\.-]?\w+)*@gmail\.com$/.test(value)) {
            return showError('#gmail-err', '(invalid gmail)');
        }

        return showSuccess('#gmail-err');
    }

    if (input.is('#phone')) {
        if (!/^\d+$/.test(value)) {
            return showError('#phone-err', '(invalid phone)');
        }
        if (value.length > 11) {
            return showError('#phone-err', '(too long)');
        }

        return showSuccess('#phone-err');
    }

    if (input.is('#name')) {
        if (!/^[\p{L}\s]*$/u.test(value) || !value) {
            return showError('#name-err', '(invalid name)');
        }
        return showSuccess('#name-err');
    }

    if (input.is('#birthday') || input.is('#num') || input.is('#street') || input.is('#ward') || input.is('#district') || input.is('#city')) {
        if (!value) {
            return showError(`#${input.attr('id')}-err`, `(invalid ${input.attr('id')})`);
        }
        return showSuccess(`#${input.attr('id')}-err`);
    }
}

function getValue(selector) {
    return $(selector).val().trim();
}

// Utils
function getBadgeClass(value, condition) {
    switch (condition) {
        case 'locked':
            return value ? 'bg-gradient-danger' : 'bg-gradient-info';
        case 'status':
            return value ? 'bg-gradient-success' : 'bg-gradient-secondary';
        case 'role':
            return value === 'admin' ? 'badge-warning' : (value === 'staff' ? 'badge-primary' : 'badge-secondary');
        default:
            return 'badge-secondary';
    }
}

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
    const date = new Date(birthdayStr);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
}

$(document).ready(init);