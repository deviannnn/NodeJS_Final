$('#name').on('focus', () => {
    $('#name').removeClass('is-invalid');
})

function nextCreateCategory() {
    const name = $('#name').val();

    if (name.trim() === '') {
        $('#name').removeClass('is-valid').addClass('is-invalid');
        $('#message-modal-fail').html("Specification\'s name cannot be empty.");
        return $('#failModal').modal('show');
    } else if (!/^[\p{L}\s]*$/u.test(name)) {
        $('#name').removeClass('is-valid').addClass('is-invalid');
        $('#message-modal-fail').html("Specification\'s name should only contain letters and spaces.");
        return $('#failModal').modal('show');
    }

    $('#next-Modal').modal('show');
}

function createCategory() {
    const name = $('#name').val();

    $.ajax({
        url: '/category/create',
        method: 'POST',
        dataType: 'json',
        data: { name },
        success: function (response) {
            $('#btn-ok-reload').hide();
            $('#btn-ok-noreload').show();
            $('#modal-success-title').text(response.title);
            $('#modal-success-msg').text(response.message);
            $('#successModal').modal('show');
            $('#successModal .btn').on('click', function () {
                window.location.href = `/category/handle?source=edit&id=${response.category._id}`;
            });
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
}