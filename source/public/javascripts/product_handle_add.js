$(document).ready(function () {
    $.ajax({
        url: '/category/getAll',
        method: 'POST',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                fillCategory(response.categories);
                fillSpecs(response.categories[0].specs);
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

function fillCategory(data) {
    const dropdown = $('#category');
    dropdown.html(data.map(item => `<option value="${item._id}">${item.name}</option>`).join(''));

    dropdown.change(function () {
        const selectedCategoryId = $(this).val();

        const selectedCategory = data.find(item => item._id === selectedCategoryId);
        const categorySpecs = selectedCategory.specs;

        fillSpecs(categorySpecs);
    });
}

function fillSpecs(categorySpecs) {
    const dropdown = $('#specs-list');
    dropdown.empty();

    categorySpecs.forEach((categorySpec, index) => {
        let options;

        options = categorySpec.options.map(option => {
            return `<option value="${option}">${option}</option>`;
        }).join('');


        dropdown.append(`
            <div class="specs col-lg-3 mt-4">
                <label for="${index}">${categorySpec.name}</label>
                <div class="choices" data-type="select-one">
                    <select id="${index}" class="form-control">${options}</select>
                </div>
            </div>
        `);
    });
}

$('#name').on('focus', () => {
    $('#name').removeClass('is-invalid');
})

function nextCreateProduct() {
    const name = $('#name').val();

    if (name.trim() === '') {
        $('#name').removeClass('is-valid').addClass('is-invalid');
        $('#message-modal-fail').html("Product\'s name cannot be empty.");
        return $('#failModal').modal('show');
    }

    $('#next-Modal').modal('show');
}

function createProduct() {
    const categoryId = $('#category').val();
    const name = $('#name').val();
    const specs = [];
    $('#specs-list .specs').each(function () {
        const specName = $(this).find('label').text().trim();
        const specOption = $(this).find('select').val();

        const spec = {
            name: specName,
            option: specOption
        };

        specs.push(spec);
    });

    $.ajax({
        url: '/product/create',
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ categoryId, name, specs }),
        success: function (response) {
            $('#btn-ok-reload').show();
            $('#btn-ok-noreload').hide();
            
            $('#modal-success-title').text(response.title);
            $('#modal-success-msg').text(response.message);
            $('#successModal').modal('show');
            $('#successModal .btn').on('click', function () {
                window.location.href = `/product/handle?source=edit&id=${response.product._id}`;
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