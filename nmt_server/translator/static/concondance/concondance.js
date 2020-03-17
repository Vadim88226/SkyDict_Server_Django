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
            if($('#id_searchWord').val() != selectedText) return;
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
    $('#id_searchWord').on('keyup', function(e) {
        var keycode = (e.keyCode ? e.keyCode : e.which);
        if(keycode != 13 && keycode != 32) {
        } else {
            $(".btn_search").click();
        }
    });
    $(document).on('click', ".btn_new", function(e) {
        $.ajax({
            url: "/upload_translationMemories/",
            type: "get",
            // data: {id: id},
            success: function(response) {
                view_template("tm_new");
                var _form = document.createElement('form');
                _form.innerHTML = response;
                $("#tm_upload_form .file_url").html(_form.file_url);
                $("#tm_upload_form .name").html(_form.name);
                $("#tm_upload_form .s_lang").html(_form.s_lang);
                $("#tm_upload_form .t_lang").html(_form.t_lang);
                $("#tm_upload_form .subject").html(_form.subject);
                $("#tm_upload_form .Note").html(_form.Note);
            }
        })
    });
    $('.btn_search_form').on('click', function (e) {
        window.location="/concondance/";
    });
    $('.btn_memories_form').on('click', function (e) {
        window.location="/manipulate_TM/";
    });
    $("#tm_list_form input[type='checkbox']").on('click', function(e){
        if(this.value == 'on') {
            $("#tm_list_form input[type='checkbox']").prop('checked', this.checked);
            if (this.checked) {
                $('#tm_list_form > div > table > tbody > tr').css('background-color','orangered');
            } else {
                $('#tm_list_form > div > table > tbody > tr').css('background-color','');
            }
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
    $('.spinner .btn:first-of-type').on('click', function() {
        if($('.spinner input').val() == 100){
            return false;
        }else{
            $('.spinner input').val( parseInt($('.spinner input').val()*1, 10) + 1);
        }
    });

    $('.spinner .btn:last-of-type').on('click', function() {
        if($('.spinner input').val() <= 1){
            return false;
        }else{
            $('.spinner input').val( parseInt($('.spinner input').val()*1, 10) - 1);
        }
    });
    $('#tm_list_form > div > table > tbody > tr input[type="checkbox"]').on('click', function(e){
        this.checked = 1 - this.checked;
    });
    $('#tm_list_form > div > table > tbody > tr').on('click', function(e){
        e.currentTarget.cells[5].childNodes[0].checked = 1 - (e.currentTarget.cells[5].childNodes[0].checked);
        if(e.currentTarget.cells[5].childNodes[0].checked)
            $(this).css('background-color','lightgrey');
        else
            $(this).css('background-color','');
    });
    $(document).on('click', ".btn_uploadTm_back", function(e) {
        $('.btn_memories_form').click();
        // view_template("div_"+suburl+"_form");
    })
    $('.btn_setting').on('click', function(e){
        $.ajax({
            url: "/update_UserSetting/",
            type: "get",
            // data: {id: id},
            success: function(response) {
                var _form = document.createElement('form');
                _form.innerHTML = response;
                $(".modal-body .s_lang").html(_form.s_lang);
                $(".modal-body .t_lang").html(_form.t_lang);
                $(".modal-body .matchRate").html(_form.matchRate);
                $(".modal-body .ignoreTags").html(_form.ignoreTags);
                _lbl = document.createElement('label');
                _lbl.setAttribute('for','id_ignoreTags');
                _lbl.textContent = ' Ignore inner tags';
                $(".modal-body .ignoreTags").append(_lbl);
            }
        })
    })
})