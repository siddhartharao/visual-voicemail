import { DeepOmit } from './DeepOmit';
import {
  ListMailboxsQuery,
} from './API';

export type MailboxType = DeepOmit<
  Exclude<ListMailboxsQuery['listMailboxs'], null>,
  '__typename'
>;