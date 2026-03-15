import { AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ModuleForm from "../modules/ModuleForm";

export const EmptyState = ({ courseId }: { courseId: string }) => (
  <div className="text-center py-16 border-2 border-dashed rounded-lg bg-muted/30">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
      <AlertCircle className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="font-semibold text-lg mb-2">No modules yet</h3>
    <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
      Start building your course by creating your first module.
    </p>
    <ModuleForm courseId={courseId}>
      <Button>
        <Plus className="h-4 w-4" />
        Create First Module
      </Button>
    </ModuleForm>
  </div>
);