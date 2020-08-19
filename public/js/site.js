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
              `<div>
              <p>${comment}</p>
              <p>By <a href="/users/portfolio/${userId}">${userName}</a></p>
              <a href="/artworks/${artworkId}/comments/${_id}" class="deleteComment">Delete</a>
            </div>`
            )
          );
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
            deleteBut.parent().remove();
          }
        });

        return false;
      });
    });
  }
  registerDeleteEvent();
})(jQuery);
