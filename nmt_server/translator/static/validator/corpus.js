var editor; // use a global for the submit and return data rendering in the examples

function ShowSelection(selectedText) {
    // selectedText = selectedText.trim();
    var sel = selectedText.split(' ');
    if (sel.length > 1 || selectedText.length == 0) { $(".dict_area").css('display', 'none'); return; }
    sel = sel[0].split(',');
    if (sel.length > 1) { $(".dict_area").css('display', 'none'); return; }
    selectedText = sel[0];

    $.ajax({
        // type: "POST",
        url: query_dict,
        data: {
            'seltext': selectedText,
            'sl': source_language.toLowerCase().substr(0, 2),
            'tl': target_language.toLowerCase().substr(0, 2)
        },
        dataType: 'json',
        success: function(data) {
            if ($('#id_searchWord').val() != selectedText) return;
            if (data != "") {
                $(".dict_area").css('display', 'flex');
                var dText = "";
                for (_dict in data.dictionary) {
                    if (data.dictionary[_dict]) {
                        dText += "<div><dictionary>" + _dict + "</dictionary><div class='content'>";
                        dText += data.dictionary[_dict] + "</div></div>";
                    }
                }
                dText = dText.replace(/\n/g, "<br>");
                dText = dText.replace(/  /g, "&nbsp; ");
                document.getElementById('translator_dict').innerHTML = dText;
                $(".dictionary_dict_area").css('display', 'block');

                dText = "";
                for (_s in data.sentences) {
                    if (data.sentences[_s]) {
                        dText += "<div><copus>" + _s + "</copus><div class='content'>";
                        dText += data.sentences[_s] + "</div></div>";
                    }
                }
                if (dText) {
                    document.getElementById('translator_sentences').innerHTML = dText;
                    $(".sentence_area").css('display', 'block');
                } else {
                    document.getElementById('translator_sentences').innerHTML = "";
                }
            } else {
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

function view_template(_templateID) {
    document.getElementById("div_Corpus_file").innerHTML = "";
    var t = document.querySelector('#' + _templateID);

    var clone = document.importNode(t.content, true);
    document.getElementById("div_Corpus_file").appendChild(clone);
};
view_template("div_" + suburl + "_form");

$(function() {


    $(document).on('click', ".btn_new", function(e) {

        $.ajax({
            url: "/upload_CorpusFile/",
            type: "get",
            // data: {id: id},
            success: function(response) {
                view_template("corpusfile_new");
                var _form = document.createElement('form');
                console.log(response);
                _form.innerHTML = response;
                $("#cf_upload_form .file_url").html(_form.file_url);
                $("#cf_upload_form .name").html(_form.name);
                $("#cf_upload_form .s_lang").html(_form.s_lang);
                $("#cf_upload_form .t_lang").html(_form.t_lang);
                $("#cf_upload_form .note").html(_form.note);
            }
        })
    });
    $('.btn_search_form').on('click', function(e) {
        window.location = "/concordance/";
    });

    $("#corpus_file_table input[type='checkbox']").on('click', function(e) {
        if (this.value == 'on') {
            $("#corpus_file_table input[type='checkbox']").prop('checked', this.checked);
            if (this.checked) {
                $('#corpus_file_table > div > table > tbody > tr').css('background-color', 'lightgrey');
            } else {
                $('#corpus_file_table > div > table > tbody > tr').css('background-color', '');
            }
        }
    })
    $(document).on('click', ".btn_delete", function(e) {
        var form_data = new FormData(corpus_file_table);
        if ($("#corpus_file_table input[type='checkbox']").is(":checked")) {
            $.confirm({
                title: 'Delete Translation Memories',
                content: 'Are you sure you want to delete these translation memories?.',
                icon: 'fa fa-question-circle',
                animation: 'scale',
                closeAnimation: 'scale',
                opacity: 0.5,
                closeIcon: true,
                buttons: {
                    'confirm': {
                        text: 'Yes',
                        action: function() {
                            corpus_file_table.submit();
                        }
                    },
                    cancel: {
                        text: 'No'
                    },
                }
            });
        }
    });
    $('.spinner .btn:first-of-type').on('click', function() {
        if ($('.spinner input').val() == 100) {
            return false;
        } else {
            $('.spinner input').val(parseInt($('.spinner input').val() * 1, 10) + 1);
        }
    });

    $('.spinner .btn:last-of-type').on('click', function() {
        if ($('.spinner input').val() <= 1) {
            return false;
        } else {
            $('.spinner input').val(parseInt($('.spinner input').val() * 1, 10) - 1);
        }
    });
    $('#corpus_file_table > div > table > tbody > tr input[type="checkbox"]').on('click', function(e) {
        this.checked = 1 - this.checked;
    });
    $('#corpus_file_table > div > table > tbody > tr').on('click', function(e) {
        e.currentTarget.cells[5].childNodes[0].checked = 1 - (e.currentTarget.cells[5].childNodes[0].checked);
        if (e.currentTarget.cells[5].childNodes[0].checked)
            $(this).css('background-color', 'lightgrey');
        else
            $(this).css('background-color', '');
    });
    $(document).on('click', ".btn_uploadTm_back", function(e) {
        // $('.btn_memories_form').click();
        view_template("div_" + suburl + "_form");
    })
});