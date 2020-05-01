django.jQuery(document).ready(() => {
    const inputs = django.jQuery('.submit-row input');
    inputs.on('click', () => inputs.attr('disabled', true));
});
