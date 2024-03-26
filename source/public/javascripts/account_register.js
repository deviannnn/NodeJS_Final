$('#name, #gmail, #birthday, #phone, #num, #street, #ward, #district, #city').on('input', function () {
    validateInput($(this));
});

$('#next-btn').on('click', onNextButtonClick);

$('#confirm-btn').on('click', onConfirmButtonClick);

function onNextButtonClick() {
    const isValid = validateAllFields();
    if (isValid) {
        $('#verifyModal').modal('show');
    } else {
        $('#message-modal-fail').text('Please correct invalid fields')
        $('#failModal').modal('show');
    }
}

function onConfirmButtonClick() {
    const isValid = validateAllFields();
    if (isValid) {
        const data = {
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
            url: '/account/register',
            method: 'POST',
            dataType: 'json',
            data: data,
            beforeSend: function () {
                $('#loadingModal').modal('show');
            },
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
            },
            complete: function () {
                setTimeout(function () {
                    $('#loadingModal').modal('hide');
                }, 500);
            }
        });
    } else {
        $('#message-modal-fail').text('Please correct invalid fields')
        $('#failModal').modal('show');
    }
}

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