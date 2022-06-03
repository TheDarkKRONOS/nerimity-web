import useAccount from "./useAccount";
import useChannels from "./useChannels";
import useMessages from "./useMessages";
import useServers from "./useServers";
import useTabs from "./useTabs";
import useUsers from "./useUsers";

export default function useStore() {
  const account = useAccount();
  const servers = useServers();
  const users = useUsers();
  const channels = useChannels();
  const tabs = useTabs();
  const messages = useMessages();

  return {
    account,
    servers,
    users,
    channels,
    tabs,
    messages
  }
}