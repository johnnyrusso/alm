document.addEventListener("DOMContentLoaded", function(e) {
  let timesheet = new Vue({
    el: "#timesheet",
    data: {
      addLocationClicked: false,

      taskForm: [
        {
          shown: "",
          taskLocation: ""
        }
      ],
      additionalLocations: [],
      taskInfo: [
        {
          taskName: "",
          taskHours: "",
          taskMinutes: ""
        }
      ]
    },
    methods: {
      addNewLocation() {
        let id;
        if (!this.additionalLocations.buttonId) {
          id = 1;
          this.additionalLocations.push({
            locationInput: "",
            taskName: "",
            taskHours: "",
            taskMinutes: "",
            taskButton: "",
            buttonId: id
          });
        } else {
          let id = this.additionalLocations.buttonId + 1;
          this.additionalLocations.push({
            locationInput: "",
            taskName: "",
            taskHours: "",
            taskMinutes: "",
            taskButton: "",
            buttonId: id
          });
        }
        {
        }
      },
      addNewTask() {
        // this.taskInfo[index].value='';
        this.taskInfo.push({});
      },
      removeTask() {
        this.taskInfo.pop();
      }
    }
  });
});
