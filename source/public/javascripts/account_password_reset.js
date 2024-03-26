$('#resetInput').on('input', function () {
    const isInputNotEmpty = $('#resetInput').val().trim() !== '';
    $('#resetBtn').prop('disabled', !isInputNotEmpty);
});

function passwordReset() {
    const value = $('#resetInput').val();

    $.ajax({
        url: '/password/reset',
        method: 'POST',
        dataType: 'json',
        data: { value: value },
        beforeSend: function () {
            $('#loadingModal').modal('show');
        },
        success: function (response) {
            if (response.success) {
                setTimeout(function () {
                    $('#modal-success-title').text(response.title);
                    $('#modal-success-msg').text(response.message);
                    $('#successModal').modal('show');
                }, 1000);
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
        },
        complete: function () {
            setTimeout(function () {
                $('#loadingModal').modal('hide');
            }, 500);
        }
    });
}