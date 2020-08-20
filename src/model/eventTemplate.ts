import * as path from 'path';

class EventItem {
  constructor(
    name: string,
    pair: Map<string, string> | undefined,
    subItem: boolean
  ) {
    this.name = name;
    this.pairs = pair;
    this.existSubItem = subItem;
  }

  hasSubEvent() {
    return this.existSubItem;
  }

  filePath() {
    return path.join(__dirname, '../events', this.name + '.json');
  }

  filePathWithSubEvent(subEventKey: string) {
    const value = this.pairs?.get(subEventKey);
    return value ? path.join(__dirname, '../events', this.name + '_' + value + '.json') : undefined;
  }

  subEventKeys() {
    let list: string[] = [];
    this.pairs?.forEach((_value, key) => {
      list.push(key);
    });
    return list;
  }

  openDialog() {
    return false;
  }

  name: string;
  pairs: Map<string, string> | undefined;
  existSubItem: boolean;
}

class BosEventItem extends EventItem {
  constructor(
  ) {
    let pair = new Map<string, string>();
    pair.set("文件上传", "put");
    pair.set("表单上传", "post");
    pair.set("追加上传", "append");
    pair.set("拷贝上传", "copy");
    pair.set("完成分片上传", "multipart");
    super("bos", pair, true);
  }
}

class DuerosEventItem extends EventItem {
  constructor(
  ) {
    let pair = new Map<string, string>();
    pair.set("打开技能", "start-session");
    pair.set("关闭技能", "end-session");
    pair.set("表达意图", "intent-answer");
    pair.set("事件上报", "event-report");
    super("dueros", pair, true);
  }
}

class HttpEventItem extends EventItem {
  constructor(
  ) {
    super("http", undefined, false);
  }
}

class HelloWorldEventItem extends EventItem {
  constructor(
  ) {
    super("hello-world", undefined, false);
  }
}

class KafkaEventItem extends EventItem {
  constructor(
  ) {
    super("kafka", undefined, false);
  }
}

class CdnEventItem extends EventItem {
  constructor(
  ) {
    let pair = new Map<string, string>();
    pair.set("域名事件", "domain-event");
    pair.set("资源预热", "object-pushed");
    pair.set("发现违禁资源", "object-blocked");
    super("cdn", pair, true);
  }
}

class CrontabEventItem extends EventItem {
  constructor(
  ) {
    super("crontab", undefined, false);
  }
}

class CustomEventItem extends EventItem {
  constructor(
    name: string,
    eventPath: string
  ) {
    super(name, undefined, false);
    this.eventPath = eventPath;
  }

  filePath() {
    return this.eventPath;
  }

  private eventPath: string;
}

export class DialogEventItem extends EventItem {
  constructor(
    name: string,
  ) {
    super(name, undefined, false);
  }

  openDialog() {
    return true;
  }
}

export class EventTemplates {
  constructor() {
    this.tpItemsMap = new Map<string, EventItem>();
    this.tpItemsMap.set("Hello-World模板", new HelloWorldEventItem());
    this.tpItemsMap.set("BOS触发器事件模板", new BosEventItem());
    this.tpItemsMap.set("DuerOS触发器事件模板", new DuerosEventItem());
    this.tpItemsMap.set("HTTP触发器事件模板", new HttpEventItem());
    this.tpItemsMap.set("CDN触发器模板", new CdnEventItem());
    this.tpItemsMap.set("消息队列触发器模板", new KafkaEventItem());
    this.tpItemsMap.set("定时触发器模板", new CrontabEventItem());
  }

  getTemplateEvent(key: string): EventItem | undefined {
    return this.tpItemsMap.get(key);
  }

  getTemplateEventList() {
    let list: string[] = [];
    this.tpItemsMap.forEach((_value, key) => {
      list.push(key);
    });
    return list;
  }

  addCustomEvent(eventName: string, eventDir: string) {
    this.tpItemsMap.set("自定义事件-" + eventName, new CustomEventItem(eventName, path.join(eventDir, eventName)));
  }

  addDialogOption(eventName: string, eventDir: string) {
    this.tpItemsMap.set("选择其它文件...", new DialogEventItem(eventName));
  }

  private tpItemsMap: Map<string, EventItem>;
}