$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    localStorage.setItem('passwordChangeToken', token);
});

$('#newPassword, #confirmPassword').on('input', function () {
    validateConfirmPassword();
});

function validateConfirmPassword() {
    const newPassword = $('#newPassword').val();
    const confirmPassword = $('#confirmPassword').val();

    if (newPassword !== '' && confirmPassword === newPassword && newPassword.length >= 6) {
        $('#confirmPassword').removeClass('is-invalid').addClass('is-valid');
        $('#changeBtn').prop('disabled', false);
        return true;
    } else {
        $('#confirmPassword').removeClass('is-valid').addClass('is-invalid');
        $('#changeBtn').prop('disabled', true);
        return false;
    }
}

function passwordChange() {
    const accountId = $('#accountId').val();
    const newPassword = $('#newPassword').val();
    const confirmPassword = $('#confirmPassword').val();
    const token = localStorage.getItem('passwordChangeToken');

    if (validateConfirmPassword()) {
        $.ajax({
            url: '/password/change',
            method: 'POST',
            dataType: 'json',
            data: { accountId, newPassword, confirmPassword },
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function (response) {
                if (response.success) {
                    $('#modal-success-title').text(response.title);
                    $('#modal-success-msg').text(response.message);
                    $('#successModal').modal('show');
                    setTimeout(function () {
                        window.location.href = '/login';
                    }, 3000);
                }
            },
            error: function (xhr, status, error) {
                let msg = '';
                if (xhr.status === 400) {
                    const response = JSON.parse(xhr.responseText);
                    msg = response.message;
                } else if (xhr.status === 200) {
                    msg = 'Perhaps your link has expired';
                    setTimeout(function () {
                        window.location.href = '/password/reset';
                    }, 3000);
                } else {
                    msg = error;
                }
                $('#message-modal-fail').html(msg);
                $('#failModal').modal('show');
            }
        });
    }
}