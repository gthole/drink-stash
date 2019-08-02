django.jQuery(document).ready(function() {
    var inputs = django.jQuery('.submit-row input');
    inputs.on('click', function() {
        inputs.attr('disabled', true);
    });
});
