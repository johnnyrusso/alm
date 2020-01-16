function ajaxGet() {
    $.ajax({
        type: 'GET',
        url: window.location + url,
        dataType: 'json',
        success: function(result) {
            console.log(result)
        }
    })

}