import { useEffect, useState } from "react";
import { formatCredit, formatNumber } from "../../helpers/formatNumber";

function MessageBuilder({ stackData }: any) {
  const [trakkrUrl]: any = useState(
    "https://github.com/skybreakdigital/trakkr-app"
  );
  const [message, setMessage]: any = useState("");
  const [discordTag, setDiscordTag]: any = useState("");
  const [startDate, setStartDate]: any = useState("");
  const [endDate, setEndDate]: any = useState("");
  const [shareDate, setShareDate]: any = useState("");
  const [startTime, setStartTime]: any = useState("");
  const [endTime, setEndTime]: any = useState("");

  const stackTypeMessage = `${
    Object.keys(stackData.type).length > 1 ? "Split Stack" : "Single"
  } - (${Object.keys(stackData.type)
    .map((key: any) => `${key}: ${stackData.type[key]}`)
    .join(", ")})`;

  const formatMessage = () => {
    const msg = `${
      discordTag ? discordTag : "{DISCORD_TAG}"
    } Hey commanders! I have a stack that is completed and ready for sharing. I am available between ${
      startDate ? startDate : "{START_DATE}"
    } and ${endDate ? endDate : "{END_DATE}"}.

**Details:**
Stack Size: \`${stackData.size === 20 ? "Full Stack" : "Partial Stack"} (${
      stackData.size
    } Missions)\`
Stack Value: \`${formatCredit(stackData.value)}\`
Stack Type: \`${stackTypeMessage}\`
    `;

    setMessage(msg);
  };

  const onCopyText = () => {
    navigator.clipboard
      .writeText(message)
      .then(() => {
        alert("Message was copied to clipboard.");
      })
      .catch((error) => {
        console.error("Failed to copy: ", error);
      });
  };

  const formatStartDate = () => {
    const [hour, minute] = startTime.split(":");

    const date = new Date(shareDate);

    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(0);

    const epochTime = Math.floor(date.getTime() / 1000);

    setStartDate(`<t:${epochTime}>`);
  };

  const formatEndDate = () => {
    const [hour, minute] = endTime.split(":");

    const date = new Date(shareDate);

    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(0);

    const epochTime = Math.floor(date.getTime() / 1000);

    setEndDate(`<t:${epochTime}>`);
  };

  const onDiscordTagChange = (e: any) => {
    setDiscordTag(e.target.value);
  };

  const onStartDateChange = (e: any) => {
    setShareDate(e.target.value);
  };

  const onTimeChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "startTime") {
      setStartTime(value);
    } else {
      setEndTime(value);
    }
  };

  useEffect(() => {
    formatMessage();
  }, [discordTag, startDate, endDate]);

  useEffect(() => {
    if (!startTime && !endTime) return;

    formatStartDate();
    formatEndDate();
  }, [shareDate, startTime, endTime]);

  return (
    <div className="MessageBuilder flex flex-column gap-3">
      {stackData.size < 20 && (
        <div className="uppercase alert">
          <i className="fa-solid fa-triangle-exclamation" /> You are sharing
          only {stackData.size} missions. We suggest sharing a full stack (20),
          as more Commanders are likely to share with you.
        </div>
      )}
      <div className="flex gap-3">
        <div className="w-4">
          <div className="flex flex-column uppercase my-2">
            <label>Discord Tag</label>
            <input
              name="startDate"
              value={discordTag}
              onChange={onDiscordTagChange}
              placeholder="@LFW-WMM"
              className="p-3 my-1"
            />
          </div>
          <div className="flex flex-column uppercase my-2">
            <label>Share Date</label>
            <input
              type="date"
              name="shareDate"
              value={shareDate}
              onChange={onStartDateChange}
              className="p-3 my-1"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-column uppercase my-2 w-full">
              <label>Start Time</label>
              <input
                type="time"
                name="startTime"
                value={startTime}
                onChange={onTimeChange}
                className="p-3 my-1"
              />
            </div>
            <div className="flex flex-column uppercase my-2 w-full">
              <label>End Time</label>
              <input
                type="time"
                name="endTime"
                value={endTime}
                onChange={onTimeChange}
                className="p-3 my-1"
              />
            </div>
          </div>
          <div className="my-3 flex">
            <button className="accent w-full" onClick={onCopyText}>
              <i className="fa-solid fa-copy" /> Copy
            </button>
          </div>
        </div>
        <div className="w-8">
          <div className="flex flex-column uppercase my-2">
            <label>My Message</label>
            <textarea
              className="w-full p-3 my-1"
              rows={15}
              value={message}
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageBuilder;
