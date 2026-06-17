export function toPublicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    createdAt: row.created_at,
  };
}

export function buildAvatarUrl(name) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=f97316&textColor=ffffff`;
}
