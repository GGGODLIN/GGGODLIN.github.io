export type CopyButtonPhase = "idle" | "copied" | "failed";

export interface CopyButtonView {
  readonly text: string;
  readonly ariaLabel: string;
  readonly copied: "true" | "false";
}

export function extractCodeBlockText(rawText: string): string {
  return rawText.replace(/\r?\n$/, "");
}

export function formatCopyButtonState(phase: CopyButtonPhase): CopyButtonView {
  if (phase === "copied") {
    return {
      text: "已複製",
      ariaLabel: "已複製程式碼",
      copied: "true",
    };
  }
  if (phase === "failed") {
    return {
      text: "複製失敗",
      ariaLabel: "複製程式碼失敗",
      copied: "false",
    };
  }
  return {
    text: "複製",
    ariaLabel: "複製程式碼",
    copied: "false",
  };
}
