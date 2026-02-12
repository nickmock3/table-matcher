type EmptyStateProps = {
  onReset?: () => void;
};

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="py-12 text-center">
      <p className="mb-4 text-sm text-text/60">
        条件に一致する店舗が見つかりませんでした。
      </p>
      <p className="mb-6 text-sm text-text/60">
        条件を変えて再検索してください。
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="rounded border border-main px-4 py-2 text-sm text-text hover:bg-main/10"
          type="button"
        >
          検索条件をリセット
        </button>
      )}
    </div>
  );
}
