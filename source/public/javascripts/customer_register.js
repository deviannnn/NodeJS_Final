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
        }
    });
}