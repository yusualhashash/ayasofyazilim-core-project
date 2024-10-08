"use client";
import type { ColumnsType } from "@repo/ayasofyazilim-ui/molecules/tables";
import DataTable from "@repo/ayasofyazilim-ui/molecules/tables";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  $UniRefund_TagService_Tags_TagListItemDto,
  type UniRefund_TagService_Tags_TagDto,
} from "@ayasofyazilim/saas/TagService";
import { toast } from "@/components/ui/sonner";
import { getBaseLink } from "src/utils";
import type { TaxFreeTag } from "./data";
import { getTags } from "./actions";

export default function Page(): JSX.Element {
  const router = useRouter();
  const [tags, setTags] = useState<UniRefund_TagService_Tags_TagDto[]>([]);
  useEffect(() => {
    async function getTagsFromAPI() {
      const tagsList = await getTags();
      if (tagsList.type === "success") {
        setTags(tagsList.data.items || []);
        toast.success(tagsList.message);
        return;
      }
      toast.error(tagsList.message);
    }
    void getTagsFromAPI();
  }, []);
  const columnsData: ColumnsType = {
    type: "Auto",
    data: {
      tableType: $UniRefund_TagService_Tags_TagListItemDto,
      excludeList: ["id"],
      actionList: [
        {
          cta: "Open in new page",
          type: "Action",
          callback: (originalRow: TaxFreeTag) => {
            router.push(
              getBaseLink(
                `app/admin/operations/details/${originalRow.taxFreeTagFacturaNumber}`,
              ),
            );
          },
        },
      ],
    },
  };

  return (
    <DataTable
      action={{
        type: "NewPage",
        cta: "Add Tag",
        href: getBaseLink("app/admin/operations/details/add"),
      }}
      columnsData={columnsData}
      data={tags}
    />
  );
}
