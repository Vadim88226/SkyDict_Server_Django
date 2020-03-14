function ShowSelection(selectedText)
{
    // selectedText = selectedText.trim();
    var sel = selectedText.split(' ');
    if (sel.length > 1 || selectedText.length == 0) {$(".dict_area").css('display', 'none');return;}
    sel = sel[0].split(',');
    if (sel.length > 1) {$(".dict_area").css('display', 'none');return;}
    selectedText = sel[0];

    $.ajax({
        // type: "POST",
        url: query_dict,
        data: {
          'seltext': selectedText,
          'sl' : source_language.toLowerCase().substr(0,2),
          'tl' : target_language.toLowerCase().substr(0,2)
        },
        dataType: 'json',
        success: function (data) {
            if($('#id_find_word').val() != selectedText) return;
            if (data != "") {
                $(".dict_area").css('display', 'flex');
                var dText = "";
                for(_dict in data.dictionary) {
                    if(data.dictionary[_dict]) {
                        dText += "<div><dictionary>" + _dict + "</dictionary><div class='content'>";
                        dText += data.dictionary[_dict] + "</div></div>";
                    }
                }
                    dText = dText.replace(/\n/g, "<br>");
                    dText = dText.replace(/  /g, "&nbsp; ");
                    document.getElementById('translator_dict').innerHTML = dText;
                    $(".dictionary_dict_area").css('display' ,  'block');

                dText = "";
                for(_s in data.sentences) {
                    if(data.sentences[_s]) {
                        dText += "<div><copus>" + _s + "</copus><div class='content'>";
                        dText += data.sentences[_s] + "</div></div>";
                    }
                }
                if(dText) {
                    document.getElementById('translator_sentences').innerHTML = dText;
                    $(".sentence_area").css('display', 'block');
                } else {
                    document.getElementById('translator_sentences').innerHTML = "";
                }
            } else  {
                $(".dict_area").css('display', 'none');
                document.getElementById('translator_dict').innerHTML = "";
                document.getElementById('translator_sentences').innerHTML = "";
            }
        },
        error: function() {
            $(".dict_area").css('display', 'none');
        },
        timeout: 2000
    });
}
function view_template(_templateID){
    document.getElementById("div_content").innerHTML = "";
    var t = document.querySelector('#'+_templateID);
    var clone = document.importNode(t.content, true);
    document.getElementById("div_content").appendChild(clone);
};
view_template("div_"+suburl+"_form");

$(function(){
    $('#id_find_word').on('keyup', function(e) {
        var keycode = (e.keyCode ? e.keyCode : e.which);
        if(keycode != 13 && keycode != 32) {
        } else {
            $(".btn_search").click();
        }
    });
    $('#id_find_word').on('change', function(e) {
        // ShowSelection($('#id_find_word').val());
    });
    $(".btn_search").on('click', function(){
        // ShowSelection($('#id_find_word').val());
    })
    $(document).on('click', ".btn_new", function(e) {
        view_template("tm_new");
    });
    $('.btn_search_form').on('click', function (e) {
        window.location="/Concondance/";
    });
    $('.btn_memories_form').on('click', function (e) {
        window.location="/transMemories/";
        // view_template("div_memories_form");
    });
    $("#tm_list_form input[type='checkbox']").on('click', function(e){
        if(this.value == 'on') {
            $("#tm_list_form input[type='checkbox']").prop('checked', this.checked);
        }
    })
    $(document).on('click', ".btn_delete", function(e) {
        var form_data = new FormData(tm_list_form);
        if($("#tm_list_form input[type='checkbox']").is(":checked")) {
            $.confirm({
                title: 'Delete Translation Memories',
                content: 'Are you sure you want to delete these translation memories?.',
                icon: 'fa fa-question-circle',
                animation: 'scale',
                closeAnimation: 'scale',
                opacity: 0.5,
                closeIcon:true,
                buttons: {
                    'confirm': {
                        text: 'Yes',
                        action: function(){
                            tm_list_form.submit();
                        }
                    },
                    cancel: { text:'No'
                    },
                }
            });
        }
    });
    $(document).on('click', ".btn_uploadTm", function(e) { 
        e.preventDefault();
        tm_upload_form.user.value = $("#U_name").val();
        var form_data = new FormData(tm_upload_form);
        $.ajax({
            type: "POST",
            url: upload_translationMemories,
            data: form_data,
            processData: false,
            contentType: false,
            enctype: "multipart/form-data",
            success: function (data) {
                if(data.status == 'ok'){
                    $.confirm({
                        icon: 'fa fa-smile-o',
                        theme: 'modern', content: data.content,
                        animation: 'scale',
                        type: 'blue',
                        autoClose: 'okay|3000',
                        escapeKey: 'okay',
                        buttons: {
                            okay: { action: view_template("tm_new") }
                        }
                    });
                } else {
                    $.alert({
                        title: 'Alert', content: data.content,
                        icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                        buttons: {
                            okay: {  }
                        }
                    });
                }
            },
            error: function() {
                $.alert({
                    title: 'Alert', content: 'SERVER ERROR',
                    icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                    buttons: {
                        okay: {  }
                    }
                });
            }
        })
    });
    $('.spinner .btn:first-of-type').on('click', function() {
        if($('.spinner input').val() == 100){
            return false;
        }else{
            $('.spinner input').val( parseInt($('.spinner input').val(), 10) + 1);
        }
    });

    $('.spinner .btn:last-of-type').on('click', function() {
        if($('.spinner input').val() == 1){
            return false;
        }else{
            $('.spinner input').val( parseInt($('.spinner input').val(), 10) - 1);
        }
    });
    $('.btn-setting-save').on('click', function(){
        
    })
})