let locations = 0;
$(document).ready(function() {
  $("#add_location").click(function() {
    if (locations === 0) {
      locations += 1;
    }
  });
  var i = 1;
  $("#add_row").click(function() {
    $("#addr" + i).html(
      `
      "<td>" +
        (i + 1) +
        "</td><td>
        <input name='name" +
        i +
        "' type='text' placeholder='Name' class='form-control input-md'  /> </td><td>
          <input  name='mail" +
        i +
        "' type='text' placeholder='task performed'  class='form-control input-md'></td><td>
          <input  name='mobile" +
        i +
        "' type='text' placeholder='hours spent on task'  class='form-control input-md'></td>"
        `
    );

    $("#tab_logic").append('<tr id="addr' + (i + 1) + '"></tr>');
    i++;
  });
  $("#delete_row").click(function() {
    if (i > 1) {
      $("#addr" + (i - 1)).html("");
      i--;
    }
  });
});
