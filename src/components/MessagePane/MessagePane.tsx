import styles from './styles.module.scss';
import RouterEndpoints from '../../common/RouterEndpoints';

import { createEffect, createRenderEffect, createSignal, For, on} from 'solid-js';
import { useLocation, useNavigate, useParams } from 'solid-app-router';
import useStore from '../../chat-api/store/useStore';
import MessageItem from '../MessageItem';

export default function MessagePane() {
  const params = useParams();
  const navigate = useNavigate();
  const {channels, tabs} = useStore();

  createEffect(() => {
    const channel = channels.get(params.channelId!);
    if (!channel) return;
  
    const path = params.serverId ? RouterEndpoints.SERVER_MESSAGES(params.serverId!, params.channelId!) : RouterEndpoints.INBOX_MESSAGES(params.channelId!);
  
    const userId = channel.recipients?.[0];
    
    tabs.openTab({
      title: channel.name,
      serverId: params.serverId!,
      userId: userId,
      iconName: params.serverId ? 'dns' : 'inbox',
      path: path,
    }, navigate, false);

  })


  return (
    <div class={styles.messagePane}>
       <MessageLogArea />
      {/*
      <MessageArea /> */}
    </div>
  );
}





const MessageLogArea = () => {
  let messageLogElement: undefined | HTMLDivElement;
  const params = useParams();
  const {channels, messages} = useStore();
  const channelMessages = () => messages.getMessagesByChannelId(params.channelId!);
  const [openedTimestamp, setOpenedTimestamp] = createSignal<null | number>(null);

  createEffect(() => {
    setOpenedTimestamp(null);
    
    const channel = channels.get(params.channelId!);
    if (!channel) return;
    messages.fetchAndStoreMessages(channel._id).then(() => {
      setOpenedTimestamp(Date.now());
    })
  })
  
  createRenderEffect(on([() => channelMessages()?.length], () => {
    if (messageLogElement) {
      messageLogElement.scrollTop = 99999;
    }
  }))
  

  

  return <div class={styles.messageLogArea} ref={messageLogElement} >
    <For each={channelMessages()}>
      {(message, i) => (
        <MessageItem
          animate={!!openedTimestamp() && message.createdAt > openedTimestamp()!}
          message={message}
          beforeMessage={channelMessages()[i() - 1]}
        />
      )}
    </For>
  </div>
}



// function MessageArea() {
//   const params = useParams();
//   const location = useLocation();

//   const [message, setMessage] = createSignal('');
//   const tabStore = store.tabStore;

//   const onKeyDown = (event: any) => {
//     if (event.key === "Enter") {
//       event.preventDefault();
//       const trimmedMessage = message().trim();
//       setMessage('')
//       if (!trimmedMessage) return;
//       const channel = client.channels.cache[params.channelId!];
//       tabStore.updateTab(location.pathname!, {opened: true})
//       store.messageStore.sendMessage(channel, trimmedMessage);
//     }
//   }
  
//   const onChange = (event: any) => {
//     setMessage(event.target?.value);
//   }


//   return <div class={styles.messageArea}>
//     <textarea placeholder='Message' class={styles.textArea} onKeyDown={onKeyDown} onChange={onChange} value={message()}></textarea>
//     {/* <CustomButton iconName='send' class={styles.button}/> */}
//   </div>
// }