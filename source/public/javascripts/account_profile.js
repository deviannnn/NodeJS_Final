let originalAvatarSrc;
$(document).ready(() => {
    originalAvatarSrc = $('#previewChangeAvt').attr('src');
});

function passwordUpdate() {
    const currentPassword = $('#currentPassword').val();
    const newPassword = $('#newPassword').val();
    const confirmPassword = $('#confirmPassword').val();

    if (validateConfirmPassword()) {
        $.ajax({
            url: '/account/password/update',
            method: 'POST',
            dataType: 'json',
            data: { currentPassword, newPassword, confirmPassword },
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
                    msg = response.message;
                } else {
                    msg = error;
                }
                $('#message-modal-fail').html(msg);
                $('#failModal').modal('show');
            }
        });
    }
};

$('#currentPassword, #newPassword, #confirmPassword').on('focus', function () {
    $(this).removeClass('is-invalid');
});

$('#currentPassword, #newPassword, #confirmPassword').on('input', function () {
    validateConfirmPassword();
});

function validateConfirmPassword() {
    const newPassword = $('#newPassword').val();
    const confirmPassword = $('#confirmPassword').val();
    const currentPassword = $('#currentPassword').val();

    if (newPassword.length >= 6 && newPassword === confirmPassword) {
        $('#newPassword').removeClass('is-invalid').addClass('is-valid');
        $('#confirmPassword').removeClass('is-invalid').addClass('is-valid');
        $('#updateBtn').prop('disabled', false);
        return true;
    } else {
        if (currentPassword === '') {
            $('#currentPassword').removeClass('is-valid').addClass('is-invalid');
        }
        $('#newPassword').removeClass('is-valid').addClass('is-invalid');
        $('#confirmPassword').removeClass('is-valid').addClass('is-invalid');
        $('#updateBtn').prop('disabled', true);
        return false;
    }
}

$('#changeAvtTab').on('click', () => {
    $('#avatar').click();
    $('#changeAvtModal').modal('show');
})

function uploadAvt() {
    const formData = new FormData();
    formData.append('Id', $('#accountId').val());
    formData.append('avatar', $('#avatar')[0].files[0]);

    if ($('#avatar')[0].files.length > 0) {
        $.ajax({
            url: '/account/uploadAvt',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.success) {
                    $('#btn-ok-reload').show();
                    $('#btn-ok-noreload').hide();

                    $('#modal-success-title').text(response.title);
                    $('#modal-success-msg').text(response.message);
                    $('#successModal').modal('show');
                } else {
                    $('#message-modal-fail').html(response.message);
                    $('#failModal').modal('show');
                }
            },
            error: function (error) {
                $('#message-modal-fail').text('Fail to upload avatar.');
                $('#failModal').modal('show');
            }
        });
    } else {
        $('#message-modal-fail').html('No image is selected. Please try again.');
        $('#failModal').modal('show');
    }
}

function chooseAvt() {
    $('#avatar').click();
}

$('#avatar').on('change', function () {
    const fileInput = $(this)[0];
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            $('#previewChangeAvt').attr('src', e.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
        $('#changeAvtBtn').prop('disabled', false);
    } else {
        $('#changeAvtBtn').prop('disabled', true);
    }
});

$('#changeAvtModal').on('hidden.bs.modal', function () {
    $('#profileTab').trigger('click');
    $('#previewChangeAvt').attr('src', originalAvatarSrc);
    $('#avatar').val('');
    $('#changeAvtBtn').prop('disabled', true);
});