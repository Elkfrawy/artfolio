(function ($) {
  const submitComment = $('#commentForm');
  const commentError = $('#commentError');

  commentError.hide();
  submitComment.submit(function (event) {
    event.preventDefault();
    commentError.hide();

    const comment = $('#comment').val();
    if (comment === undefined || comment === '' || comment === null) {
      commentError.show();
      commentError.text('Please provide a comment text');
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
          commentError.show();
          commentError.text(responseMessage.error);
        } else {
          commentError.hide();
          const { _id, comment, userId, userName } = responseMessage.createdComment;
          const artworkId = responseMessage.artworkId;
          const commentsContainer = $('#commentsContainer');
          commentsContainer.append(
            $(
              `
        <div class="media my-4">
          <img class="d-flex mr-3 rounded-circle" src="http://placehold.it/50x50" alt="">
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
            commentError.show();
            commentError.text(responseMessage.error);
          } else {
            commentError.hide();
            deleteBut.parent().parent().remove();
          }
        });

        return false;
      });
    });
  }
  registerDeleteEvent();
})(jQuery);
