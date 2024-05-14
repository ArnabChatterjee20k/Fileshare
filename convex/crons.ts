import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.weekly(
  "clear delete files",
  { hourUTC: 17, minuteUTC: 30, dayOfWeek: "monday" },
  internal.files.deleteFilesFromTrash
);

export default crons;
