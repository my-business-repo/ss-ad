import { Chatting } from "@/components/Chatting";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function ChattingPage() {
    return (
        <>
            <Breadcrumb pageName="Chatting" />

            <div className="flex flex-col gap-10">
                <Chatting />
            </div>
        </>
    );
}
