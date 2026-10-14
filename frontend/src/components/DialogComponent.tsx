import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface DialogDemoProps {
    handleOkToggle: () => Promise<void> | void;
    handleCloseToggle: () => void;
    isToggleClicked: boolean;
    toggleId: string | null;
    loadingId: string | null;
}

export function DialogDemo({
    handleOkToggle,
    handleCloseToggle,
    isToggleClicked,
    toggleId,
    loadingId,
}: DialogDemoProps) {
    return (
        <Dialog
            open={isToggleClicked}
            onOpenChange={(open) => {
                if (!open) handleCloseToggle()
            }}
        >
            <DialogContent className="sm:max-w-sm overflow-hidden border border-violet-500/30 bg-slate-900 text-white shadow-2xl shadow-violet-950/40">

                {/* Top highlight */}
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-violet-500 via-purple-400 to-emerald-400" />

                <DialogHeader className="space-y-3 pt-3">
                    {/* Icon */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-6 w-6 text-emerald-400"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m5 12 4 4L19 6"
                            />
                        </svg>
                    </div>

                    <DialogTitle className="text-xl font-bold tracking-tight text-white">
                        Complete Task?
                    </DialogTitle>

                    <DialogDescription className="text-sm leading-relaxed text-slate-300">
                        Are you sure you want to mark this task as completed?
                        You can celebrate another step forward!
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-5 gap-2 sm:gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseToggle}
                        disabled={loadingId === toggleId}
                        className="border-slate-600 bg-slate-800 text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-700 hover:text-white"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        onClick={handleOkToggle}
                        disabled={loadingId === toggleId}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 font-semibold text-white shadow-lg shadow-purple-950/40 transition-all hover:from-violet-500 hover:to-purple-500 disabled:opacity-60"
                    >
                        {loadingId === toggleId ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Completing...
                            </span>
                        ) : (
                            "Complete Task"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}