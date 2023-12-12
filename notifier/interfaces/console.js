/** @type {import('../types').LoggingInterface} */
export default function LogToConsole(payload) {
  const out = payload?.isError === false ? console.log : console.error;

  out("______________________________");
  out(new Date());
  if (payload.tag) out(`TAG — ${payload.tag}`);
  if (Array.isArray(payload.args)) payload.args.forEach((message) => out(message));
  else out(payload);
  out("______________________________");
}
