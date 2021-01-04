// Current Product id
let omgfaqs_productId = __st && __st.p == 'product' && __st.rid ? __st.rid : null;
let omgfaqs_storeSettings;
let omgfaqs_storeFaqs;
let omgfaqs_shopName = Shopify.shop;
let omgfaqs_countFaqs;
function omgfaqs_getJsonFile() {
    var d = new Date(),
        v = d.getTime();
    $.getJSON(`${rootlinkProductFaqs}/cache/${omgfaqs_shopName}/data.json?v=${v}`, (data) => {
        omgfaqs_storeSettings = data.app.settings;
        if (omgfaqs_productId != null) {
            jQuery.get(rootlinkProductFaqs + '/productfaqs.php', {
                action: 'getProductFaqs',
                shop: omgfaqs_shopName,
                productid: omgfaqs_productId,
            }, function (result) {
                if (typeof result == "string") {
                    result = JSON.parse(result);
                }
                omgfaqs_countFaqs = parseInt(result.count)
                $("body").append(`
                <style>
                    .question-button button,.question-button button:hover,.question-button button:focus,
                    .reply-form .reply_submit input,.reply-form .reply_submit input:hover,.question-loadmore,.question-nomore,.question-form #faqs_submit #question-form-submit
                    {background:${omgfaqs_storeSettings.bg_color};color:${omgfaqs_storeSettings.text_color};}"
                    ${omgfaqs_storeSettings.customcss}
                </style>`);
                if ($('.ot-product-faqs').length > 0) {
                    omgfaqs_getProductFaqsContent(result.lists)
                }
            });
        }
    });
}
function omgfaqs_getProductFaqsContent(lists, count) {
    var emptyQuestion = (omgfaqs_countFaqs == 0) ? `<div class="ot-faqs-notice-no-question">No question yet</div>` : "",
        loadmore = (lists.length == omgfaqs_storeSettings.per_page) ? `
            <div>
                <input type="hidden" id="loadmore_product_id" value="${omgfaqs_productId}" name="product_id">
                <a class="question-loadmore" onclick="getMoreQuestion(event)">${omgfaqs_storeSettings.loadmore_button}</a>
                <a class="question-nomore">${omgfaqs_storeSettings.nomore_button}</a>
            </div>
        ` : "",
        answer = "";
    lists.forEach(element => {
        answer += omgfaqs_getProductAnswer(element);
    });
    $('.ot-product-faqs').html(`
        <h2 class="faqs-header-title">${omgfaqs_storeSettings.header_title}</h2>
        <span class="question-button">
            <button type="button" class="btn btn-default" onclick="omgrfq_toggleQuestionForm()">${omgfaqs_storeSettings.ask_question_button}</button>
        </span>
        <div class="question-form">
            <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
            <form role="form" enctype="multipart/form-data" id="omgrfq-question-form" method="post" name="omgrfq-question-form" onsubmit="omgfaqs_submitQuestion(event);return false;">
                <div id="faqs_name">
                    <input type="text" id="faqs_name_input" placeholder="${omgfaqs_storeSettings.author_field}" required>
                </div>
                <div id="faqs_email">
                    <input type="email" name="faqs_email"
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$"
                        placeholder="${omgfaqs_storeSettings.email_field}" required>
                </div>
                <div id="faqs_question">
                    <input type="text" placeholder="${omgfaqs_storeSettings.question_field}" maxlength="${omgfaqs_storeSettings.maximum_char}" required>
                </div>
                <div id="faqs_submit">
                    <input type="submit" id="question-form-submit" name="question-form-submit" value="${omgfaqs_storeSettings.submit_text}">
                </div>
            </form>
        </div>`
        + emptyQuestion + `
        <div class="ot-faqs-notice-addquestion-success">${omgfaqs_storeSettings.success_mess}</div>
        <div class="ot-faqs-notice-addquestion-error">${omgfaqs_storeSettings.error_mess}</div>
        <div class="question-answer-box">
            <div class="question-answer-list">`
        + answer + `
            </div>`
        + loadmore + `
        </div>
    `);
}

function omgfaqs_getProductAnswer(element) {
    var listAnswer = [];
    element.answer_lists.forEach(a => {
        if (a.publish == 1) listAnswer.push(a);
    });
    var like = (parseInt(element.vote) > 1) ? "Votes" : "Vote",
        voteDown = (parseInt(element.vote) > 0) ? `<a id="question-vote-down-${element.id}" class="question-vote-button question-vote-down" onclick="voteDownQuestion(event,${element.id})"></a>` : "",
        lock = (element.id == 1) ? `<span class="locked-question"><img title="Locked question" src="${rootlinkProductFaqs}/assets/images/locked.png"></span>` : "",
        html = "",
        answerHtml = "",
        reply = "";
    if (listAnswer.length > 0) {
        var answerHtml = `<div class="answer-list">`;
        for (var i = 0; i < listAnswer.length; i++) {
            answerHtml += `<div class="answer-item">
                                <h4>By ${listAnswer[i].name} <span class="answer-date">${listAnswer[i].answerAgo}</span></h4>
                                <div class="answer-content">${listAnswer[i].answer}</div>
                            </div>`;
            if (i == 0) answerHtml += `<div class="more-answer">`;
        }
        answerHtml += "</div>";

        if (listAnswer.length > 1) answerHtml += `
                        <div class="loadmore-answer"><a onclick="seeMoreAnswers(${element.id})"><img src="${rootlinkProductFaqs}/assets/images/arrow-double-down.png" style="width:8px;"> ${omgfaqs_storeSettings.see_more_answer} (` + (listAnswer.length - 1) + `)</a></div>
                        <div class="collapse-answer"><a onclick="collapseAllAnswers(${element.id})"><img src="${rootlinkProductFaqs}/assets/images/arrow-double-up.png" style="width:8px;"> ${omgfaqs_storeSettings.collapse_all_answers}</a></div>`;
        answerHtml += "</div>";
    }
    if (element.locked == 0) {
        reply += `<div class="open-reply-form" id="open-reply-form-${element.id}"><a onclick="openReplyForm(${element.id})"><img src="${rootlinkProductFaqs}/assets/images/reply.png" style="width:12px;"> ${omgfaqs_storeSettings.reply_text}</a></div>
                        <div class="close-reply-form" id="close-reply-form-${element.id}"><a onclick="closeReplyForm(${element.id})"><img src="${rootlinkProductFaqs}/assets/images/reply.png" style="width:12px;"> ${omgfaqs_storeSettings.close_text}</a></div>
                        <div id="reply-form-${element.id}" class="reply-form">
                            <form role="form" method="post" name="replyform" onsubmit="submitReply(event,${element.id});return false;">
                                <div class="reply_name">
                                    <input type="text" name="reply_name" placeholder="${omgfaqs_storeSettings.author_field}" required>
                                </div>
                                <div class="reply_email">
                                    <input type="email" name="reply_email"
                                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$"
                                        placeholder="${omgfaqs_storeSettings.email_field}" required>
                                </div>
                                <div class="reply_answer">
                                    <input type="text" name="reply_answer" id="reply_answer" placeholder="${omgfaqs_storeSettings.question_field}" maxlength="${omgfaqs_storeSettings.maximum_char}" required>
                                </div>
                                <div class="reply_submit">
                                    <input type="submit" id="reply-form-submit" name="reply-form-submit" value="${omgfaqs_storeSettings.submit_text}">
                                </div>
                            </form>
                        </div>
                        <div class="ot-faqs-notice-addreply-success">${omgfaqs_storeSettings.success_mess}</div>
                        <div class='ot-faqs-notice-addreply-error'>${omgfaqs_storeSettings.error_mess}</div>`;
    }
    html += `<div class="question-item" id="question-item-${element.id}">
                <div class="question-item-col-1">
                    <input type="hidden" id="question-vote-value-${element.id}" value="${element.vote}" name="product_id">
                    <a id="question-vote-up-${element.id}" class="question-vote-button question-vote-up" onclick="voteUpQuestion(event,${element.id})"></a>
                    <p id="question-vote-${element.id}" class="question-vote">${element.vote}</p>
                    <p id="question-vote-text-${element.id}" class=:question-vote-text">${like}</p>`
        + voteDown + `
                </div>
                <div class="question-item-col-2">
                    <div class="question-list-content">
                        <h3>By ${element.faqs_name} <span class="publishdate">${element.askAgo}</span>${lock}</h3>
                        <div class="question-content">${element.faqs_question}</div>
                    </div>
                    <div class="answer-list-content">`
        + answerHtml
        + reply + `
                    </div>
                </div>
            </div>`;
    // console.log(element.answer_lists);
    return html;
}

function omgrfq_toggleQuestionForm() {
    $('.ot-product-faqs .question-form').toggle('slow', function () { });
}
function seeMoreAnswers(id) {
    jQuery(".ot-product-faqs #question-item-" + id + " .more-answer").show("slow");
    jQuery(".ot-product-faqs #question-item-" + id + " .collapse-answer").show("slow");
    jQuery(".ot-product-faqs #question-item-" + id + " .loadmore-answer").hide("slow");
}
function collapseAllAnswers(id) {
    jQuery(".ot-product-faqs #question-item-" + id + " .loadmore-answer").show("slow");
    jQuery(".ot-product-faqs #question-item-" + id + " .more-answer").hide("slow");
    jQuery(".ot-product-faqs #question-item-" + id + " .collapse-answer").hide("slow");
}
function openReplyForm(id) {
    jQuery(".ot-product-faqs #open-reply-form-" + id).hide("slow");
    jQuery(".ot-product-faqs #reply-form-" + id).show("slow");
    jQuery(".ot-product-faqs #close-reply-form-" + id).show("slow");
}
function closeReplyForm(id) {
    jQuery(".ot-product-faqs #open-reply-form-" + id).show("slow");
    jQuery(".ot-product-faqs #reply-form-" + id).hide("slow");
    jQuery(".ot-product-faqs #close-reply-form-" + id).hide("slow");
}
function omgfaqs_submitQuestion(e) {
    e.preventDefault();
    $('.ot-product-faqs .question-form #question-form-submit').prop('disabled', true).css('cursor', 'default');
    if (omgfaqs_shopName == 'product-questions-and-answers-demo.myshopify.com') {
        $('.ot-product-faqs .question-form #question-form-submit').prop('disabled', false);
        $('.ot-product-faqs .question-form').fadeOut('slow');
        $('.ot-product-faqs span.question-button').fadeOut('slow');
        $('.ot-faqs-notice-addquestion-success').fadeIn(300);
    } else {
        var form_data = new FormData(),
            question = {
                faqName: $('.ot-product-faqs .question-form #faqs_name input').val(),
                faqEmail: $('.ot-product-faqs .question-form #faqs_email input').val(),
                faqQuestion: $('.ot-product-faqs .question-form #faqs_question input').val(),
            };

        form_data.append("shop", omgfaqs_shopName);
        form_data.append("action", 'submitQuestion');
        form_data.append("productid", omgfaqs_productId);
        form_data.append("data", JSON.stringify(question));

        axios
            .post(rootlinkProductFaqs + '/productfaqs.php', form_data)
            .then(function (res) {
                $('.ot-product-faqs .question-form #question-form-submit').prop('disabled', false);
                $('.ot-product-faqs .question-form').fadeOut('slow')
                $('.ot-product-faqs span.question-button').fadeOut('slow')
                if (res.data == true) {
                    $('.ot-faqs-notice-addquestion-success').fadeIn(300)
                } else {
                    $('.ot-faqs-notice-addquestion-error').fadeIn(300)
                }
            })
            .catch(function (error) { });
    }
}
function submitReply(e, id) {
    e.preventDefault();
    var form_data = new FormData(),
        answer = {
            faqName: $('.ot-product-faqs #question-item-' + id + ' .reply-form .reply_name input').val(),
            faqEmail: $('.ot-product-faqs #question-item-' + id + ' .reply-form .reply_email input').val(),
            faqQuestion: $('.ot-product-faqs #question-item-' + id + ' .reply-form .reply_answer input').val(),
        };

    jQuery('.ot-product-faqs #question-item-' + id + ' .reply-form #reply-form-submit').prop('disabled', true).css('cursor', 'default');
    form_data.append("shop", omgfaqs_shopName);
    form_data.append("action", 'submitReply');
    form_data.append("productid", omgfaqs_productId);
    form_data.append("id", id);
    form_data.append("data", JSON.stringify(answer));
    axios
        .post(rootlinkProductFaqs + '/productfaqs.php', form_data)
        .then(function (res) {
            $('.ot-product-faqs #question-item-' + id + ' .close-reply-form').hide("slow");
            $('.ot-product-faqs #question-item-' + id + ' .reply-form').hide("slow");
            $('.ot-product-faqs #question-item-' + id + ' .open-reply-form').hide("slow");
            if (res.data == true) {
                $('#question-item-' + id + ' .ot-faqs-notice-addreply-success').fadeIn(300)
            } else {
                $('#question-item-' + id + ' .ot-faqs-notice-addreply-error').fadeIn(300)
            }
        })
        .catch(function (error) { });
}
function getMoreQuestion(e) {
    e.preventDefault();
    var offset = Number($(".ot-product-faqs .question-answer-box .question-item").length),
        form_data = new FormData();
    $(".ot-product-faqs .question-loadmore").prop('disabled', true).css('cursor', 'default');
    form_data.append("shop", omgfaqs_shopName);
    form_data.append("action", 'getMoreQuestion');
    form_data.append("productid", omgfaqs_productId);
    form_data.append("offset", offset);

    axios
        .post(rootlinkProductFaqs + '/productfaqs.php', form_data)
        .then(function (res) {
            console.log(res)
            if (typeof res == "string") {
                res = JSON.parse(res);
            }
            var html = "";
            res.data.forEach(element => {
                html += omgfaqs_getProductAnswer(element);
            });
            $(".ot-product-faqs .question-answer-box .question-answer-list").append(html);
            if (Number($(".ot-product-faqs .question-answer-box .question-item").length) == omgfaqs_countFaqs) {
                $(".ot-product-faqs .question-loadmore").hide("slow");
                $(".ot-product-faqs .question-nomore").css('display', 'inline-block');
            }
            $(".ot-product-faqs .question-loadmore").prop('disabled', false).css('cursor', 'pointer');;
        })
        .catch(function (error) { });
}
function voteUpQuestion(e, id) {
    e.preventDefault();
    if (meta.page.customerId) {
        var form_data = new FormData();

        form_data.append("shop", omgfaqs_shopName);
        form_data.append("action", 'voteUpQuestion');
        form_data.append("questionId", id);
        form_data.append("vote", $('#question-vote-value-' + id).val());

        axios
            .post(rootlinkProductFaqs + '/productfaqs.php', form_data)
            .then(function (res) {
                $('.ot-product-faqs #question-vote-' + id).text(res.data);
                $('#question-vote-value-' + id).val(res.data)
                if (res.data > 1) {
                    $('.ot-product-faqs #question-vote-text-' + id).text('Votes');
                }
                $('.ot-product-faqs #question-vote-down-' + id).hide("slow");
                $('.ot-product-faqs #question-vote-up-' + id).hide("slow");
                alert(omgfaqs_storeSettings.vote_success);
            })
            .catch(function (error) { });
    } else {
        jQuery(location).attr('href', 'https://' + omgfaqs_shopName + '/account/login');
    }
}
function voteDownQuestion(e, id) {
    e.preventDefault();
    if (meta.page.customerId) {
        var form_data = new FormData();

        form_data.append("shop", omgfaqs_shopName);
        form_data.append("action", 'voteDownQuestion');
        form_data.append("questionId", id);
        form_data.append("vote", $('#question-vote-value-' + id).val());

        axios
            .post(rootlinkProductFaqs + '/productfaqs.php', form_data)
            .then(function (res) {
                $('.ot-product-faqs #question-vote-' + id).text(res.data);
                $('#question-vote-value-' + id).val(res.data)
                if (res.data == 1) {
                    $('.ot-product-faqs #question-vote-text-' + id).text('Vote');
                } else if (res.data == 0) {
                    jQuery('.ot-product-faqs #question-vote-down-' + id).hide("slow");
                }
                $('.ot-product-faqs #question-vote-down-' + id).hide("slow");
                $('.ot-product-faqs #question-vote-up-' + id).hide("slow");
                alert(omgfaqs_storeSettings.vote_success);
            })
            .catch(function (error) { });
    } else {
        jQuery(location).attr('href', 'https://' + omgfaqs_shopName + '/account/login');
    }
}