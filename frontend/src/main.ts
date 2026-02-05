import "./style.css";

type MemberResponse = {
  student_id: string;
  name: string;
  grade: string;
  remark: string | null;
};

type StatusState = "idle" | "loading" | "success" | "error";

const STORAGE_KEY = "membersViewerApiBase";
const DEFAULT_BASE_URL =
  (import.meta.env.VITE_DEFAULT_API_BASE as string | undefined)?.trim() ||
  "https://kunitake.net/members";

const formEl = querySelector<HTMLFormElement>("#member-form");
const baseInputEl = querySelector<HTMLInputElement>("#api-base-input");
const statusEl = querySelector<HTMLDivElement>("#status-msg");
const resultEl = querySelector<HTMLDivElement>("#member-result");
const clearBtn = querySelector<HTMLButtonElement>("#clear-storage");

const savedBase = window.localStorage.getItem(STORAGE_KEY);
baseInputEl.value = savedBase || DEFAULT_BASE_URL;

setPlaceholder("まだ結果はありません");
updateStatus("待機中", "idle");

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const baseUrl = baseInputEl.value.trim();
  window.localStorage.setItem(STORAGE_KEY, baseUrl);
  await fetchMember(baseUrl);
});

clearBtn.addEventListener("click", () => {
  window.localStorage.removeItem(STORAGE_KEY);
  baseInputEl.value = DEFAULT_BASE_URL;
});

async function fetchMember(baseUrl: string) {
  const endpoint = buildEndpoint(baseUrl);
  updateStatus("呼び出し中…", "loading");
  setPlaceholder("レスポンスを待っています…");

  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
    }

    const member: MemberResponse = await response.json();
    renderMember(member);
    updateStatus("/members から最新の結果を取得しました", "success");
  } catch (error) {
    console.error(error);
    updateStatus("エラーが発生しました", "error");
    showError(error instanceof Error ? error.message : "不明なエラーです");
  }
}

function buildEndpoint(baseUrl: string): string {
  if (!baseUrl) {
    return `${window.location.origin.replace(/\/$/, "")}/members`;
  }

  const normalized = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  try {
    return new URL("members", normalized).toString();
  } catch {
    throw new Error("有効なAPI URLを入力してください (例: https://example.com)");
  }
}

function renderMember(member: MemberResponse) {
  const format = (value: unknown) =>
    value === null || value === undefined || value === ""
      ? "—"
      : escapeHtml(String(value));

  resultEl.innerHTML = `
    <dl class="member-card">
      <dt>氏名</dt>
      <dd>${format(member.name)}</dd>
      <dt>学年</dt>
      <dd>${format(member.grade)}</dd>
      <dt>学籍番号</dt>
      <dd>${format(member.student_id)}</dd>
      <dt>備考</dt>
      <dd>${format(member.remark)}</dd>
    </dl>
    <div class="raw-json"><pre>${escapeHtml(
      JSON.stringify(member, null, 2)
    )}</pre></div>
  `;
}

function showError(message: string) {
  resultEl.innerHTML = `<p class="placeholder">${escapeHtml(message)}</p>`;
}

function setPlaceholder(message: string) {
  resultEl.innerHTML = `<p class="placeholder">${escapeHtml(message)}</p>`;
}

function updateStatus(text: string, state: StatusState) {
  statusEl.textContent = text;
  statusEl.dataset.state = state;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

function querySelector<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`${selector} が見つかりません`);
  }
  return element;
}
