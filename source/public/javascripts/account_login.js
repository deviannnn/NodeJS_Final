function checkInputLength() {
    const username = $('#username').val();
    const password = $('#password').val();

    if (username.length >= 1 && password.length >= 5) {
        $('#loginBtn').prop('disabled', false);
    } else {
        $('#loginBtn').prop('disabled', true);
    }
}

function login() {
    const username = $('#username').val();
    const password = $('#password').val();

    $.ajax({
        url: '/login',
        method: 'POST',
        dataType: 'json',
        data: { username, password },
        success: function (response) {
            if (response.success) {
                localStorage.setItem('token', response.token);
                window.location.href = '/';
            }
        },
        error: function (xhr, status, error) {
            let msg = '';
            if (xhr.status === 400) {
                $('#password').val('');
                const response = JSON.parse(xhr.responseText);
                msg = response.message;
            } else {
                msg = error;
            }
            $('.alert-text').html(msg);
            $('.alert').fadeIn();
            setTimeout(function () {
                $('.alert').fadeOut();
            }, 3000);
        }
    });
}