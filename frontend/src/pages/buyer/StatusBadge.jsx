const statusConfig = {
  Pending: {
    bg: "bg-warning/10",
    text: "text-warning",
  },
  Accepted: {
    bg: "bg-primary/10",
    text: "text-primary",
  },
  "Driver Assigned": {
    bg: "bg-primary/10",
    text: "text-primary",
  },
  "In Transit": {
    bg: "bg-primary/10",
    text: "text-primary",
  },
  Delivered: {
    bg: "bg-success/10",
    text: "text-success",
  },
  Cancelled: {
    bg: "bg-danger/10",
    text: "text-danger",
  },
  Failed: {
    bg: "bg-danger/10",
    text: "text-danger",
  },
  Success: {
    bg: "bg-success/10",
    text: "text-success",
  },
};

export default function StatusBadge({
  status,
  className = "",
}) {
  const style =
    statusConfig[status] || {
      bg: "bg-secondary/20",
      text: "text-primary",
    };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-md
        px-3
        py-1
        text-xs
        font-semibold
        ${style.bg}
        ${style.text}
        ${className}
      `}
    >
      {status}
    </span>
  );
}