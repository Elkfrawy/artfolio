(function ($) {
  const submitComment = $('#commentForm');
  const errorMessages = $('#error-messages');

  // errorMessages.hide();
  submitComment.submit(function (event) {
    event.preventDefault();
    errorMessages.empty();
    const hasError = false;

    // For each field do validation
    const comment = $('#comment').val();
    if (comment === undefined || comment === '' || comment === null) {
      errorMessages.append('<li>Please provide a comment text</li>');
      hasError = true;
    } else {
      const artworkId = $('#artworkId').val();
      let requestConfig = {
        method: 'POST',
        url: submitComment.attr('action'),
        contentType: 'application/json',
        data: JSON.stringify({
          comment,
          artworkId,
        }),
      };

      $.ajax(requestConfig).then(function (responseMessage) {
        if (responseMessage.error) {
          errorMessages.show();
          errorMessages.text(responseMessage.error);
        } else {
          const { _id, comment, userId, userName } = responseMessage.createdComment;
          const artworkId = responseMessage.artworkId;
          const commentsContainer = $('#commentsContainer');
          commentsContainer.append(
            $(
              `
        <div class="media my-4">
          <img class="d-flex mr-3 rounded-circle avatar-lg" src="/pictures/user/${userId}" alt="">
          <div class="media-body">
            <h5 class="mt-0"> <a href="/users/portfolio/${userId}">${userName}</a></h5>
            ${comment}
            <br>
            <a href="/artworks/${artworkId}/comments/${_id}" class="deleteComment btn btn-danger btn-sm my-2">Delete</a>
          </div>
        </div>
        `
            )
          );
          $('#comment').val('');
          registerDeleteEvent();
        }
      });
    }
  });

  function registerDeleteEvent() {
    $('.deleteComment').each(function () {
      const deleteBut = $(this);
      const deleteLink = deleteBut.attr('href');
      deleteBut.click(function () {
        let requestConfig = {
          type: 'DELETE',
          url: deleteLink,
        };

        $.ajax(requestConfig).then(function (responseMessage) {
          if (responseMessage.error) {
            errorMessages.show();
            errorMessages.text(responseMessage.error);
          } else {
            errorMessages.hide();
            deleteBut.parent().parent().remove();
          }
        });

        return false;
      });
    });
  }
  registerDeleteEvent();

  // Forms XXXX validation
  const myForm = $('#myformId');
  myForm.submit(function (event) {
    errorMessages.empty();
    const hasError = false;

    // For each field do validation
    const commentText = $('#comment').val();
    if (commentText === undefined || commentText === '') {
      errorMessages.append('<li>You must provide text</li>');
      hasError = true;
    } // and so on with other fields

    if (hasError) {
      event.preventDefault();
      return false;
    }
    return true;
  });
})(jQuery);
