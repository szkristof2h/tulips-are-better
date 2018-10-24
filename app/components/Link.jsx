import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link as ReactLink } from 'react-router';
import { get, normal, post } from '../actions/api';



class Link extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.getLinkData = this.getLinkData.bind(this);
  }

  getLinkData() {
    const { type, action, data = {} } = this.props;
    switch (type) {
      case 'comment':
        switch (action) {
          case 'comments': return {
            link: `${data.tab === 'dashboard' ? 'dashboard/' : ''}${data.id}/comments/${data.offset}`, method: 'get',
            redirect: false
          };
          case 'down': return { link: `comment/rating/${data.id}`, method: 'post', redirect: false };
          case 'down_remove': return { link: `remove/rating/${data.rId}`, method: 'post', redirect: false };
          case 'edit': return { link: `comment/edit/${data.id}`, method: 'normal', name: 'EDIT_COMMENT',
            redirect: false };
          case 'up': return { link: `comment/rating/${data.id}`, method: 'post', redirect: false };
          case 'up_remove': return { link: `remove/rating/${data.rId}`, method: 'post', redirect: false };
          case 'replies': return { link: `${data.id}/replies/${data.offset}`, method: 'get', redirect: false };
          case 'reply': return { link: ``, method: 'normal', name: 'SET_REPLY', redirect: false };
          case 'report': return { link: `report/comment/${data.id}`, method: 'normal', name: 'COMMENT_REPORT',
            redirect: false };
          case 'confirm_report': return { link: `report/comment`, method: 'post', redirect: false };
          case 'typos': return { link: `${data.tab === 'dashboard' ? 'dashboard/' : ''}${data.id}/typos/${data.offset}`,
            method: 'get', redirect: false };
          default: return null;
        }
      case 'chapter':
        switch (action) {
          case 'down': return { link: `chapter/rating/${data.id}`, method: 'post', redirect: false };
          case 'down_remove': return { link: `remove/rating/${data.rId}`, method: 'post', redirect: false };
          case 'like': return { link: `asdasd`, method: 'post', redirect: false };
          case 'report': return { link: `report/`, method: 'post', redirect: false };
          case 'thanks': return { link: `chapter/rating/${data.id}`, method: 'post', redirect: false };
          case 'thanks_remove': return { link: `remove/rating/${data.rId}`, method: 'post', redirect: false };
          case 'up': return { link: `chapter/rating/${data.id}`, method: 'post', redirect: false };
          case 'up_remove': return { link: `remove/rating/${data.rId}`, method: 'post', redirect: false };
          default: return null;
        }
      case 'conversation':
        switch (action) {
          case 'delete': return { link: `${data.id}/delete`, method: 'post', redirect: false };
          case 'inbox': return { link: `conversations/inbox`, method: 'get', name: 'GET_CONVERSATIONS',
            redirect: false };
          case 'join': return { link: `conversations/join`, method: 'get', redirect: false };
          case 'message': return { link: `conversations/${data.id}/0`, method: 'none', redirect: true };
          case 'more_message': return { link: `getConversation/${data.id}/${data.offset}`, method: 'get',
            redirect: false };
          case 'new': return { link: `conversations/new`, method: 'get', redirect: false };
          case 'star': return { link: `${data.id}/star`, method: 'post', redirect: false };
          case 'starred': return { link: `conversations/starred`, method: 'get', name: 'GET_CONVERSATIONS',
            redirect: false };
          case 'trash': return { link: `${data.id}/trash`, method: 'post', redirect: false };
          case 'trashed': return { link: `conversations/trashed`, method: 'get', name: 'GET_CONVERSATIONS',
            redirect: false };
          case 'unstar': return { link: `${data.id}/unstar`, method: 'post', redirect: false };
          case 'untrash': return { link: `${data.id}/untrash`, method: 'post', redirect: false };
          default: return null;
        }
      case 'dashboard':
        switch (action) {
          case 'hide_stats': return { link: ``, method: 'normal', name: 'HIDE_STATS', redirect: false };
          case 'more_chapters': return { link: `getDashboard/book/${data.pId}/chapters/${data.cId}/${data.offset}`,
            method: 'get', redirect: false };
          case 'no_year': return { link: ``, method: 'normal', name: 'DASHBOARD_NO_YEAR_FAILURE', redirect: false };
          case 'show_stats': return { link: ``, method: 'normal', name: 'SHOW_STATS', redirect: false };
          case 'stat_choose': return { link: ``, method: 'normal', name: 'DASHBOARD_STAT_CHOOSE', redirect: false };
          case 'stat_choose_confirm': return { link: ``, method: 'normal', name: 'DASHBOARD_STAT_CHOOSE_CONFIRM',
            redirect: false };
          case 'stat_tab': return { link: ``, method: 'normal', name: 'DASHBOARD_STAT_TAB', redirect: false };
          default: return null;
        }
      case 'editor':
        switch (action) {
          case 'add_author': return { link: `editor/add/author`, method: 'post', redirect: false };
          case 'category': return { link: ``, method: 'normal', name: 'ADD_CATEGORY', redirect: false };
          case 'choose_position': return { link: ``, method: 'normal', name: 'CHOOSE_POSITION', redirect: false };
          case 'choose_parent': return { link: `editor/choose/parent/${(data.parents[data.id].id).
            replace('fictions/', '')}/${data.id}`, method: 'get', redirect: false
          };
          case 'choose_schedule_type': return { link: ``, method: 'normal', name: 'CHOOSE_SCHEDULE_TYPE',
            redirect: false };
          case 'choose_volume': return { link: ``, method: 'normal', name: 'CHOOSE_VOLUME', redirect: false };
          case 'confirm_edit': return { link: `editor/edit/${data.type}`, name: data.type === 'comment' ?
            'POST_COMMENT_EDIT' : data.type === 'review' ? 'POST_REVIEW_EDIT' : '', method: 'post', redirect: false
          };
          case 'follower_chapter': return { link: ``, method: 'normal', name: 'SET_FOLLOWER_CHAPTER', redirect: false };
          case 'formatting': return { link: ``, method: 'normal', name: 'KEEP_FORMATTING', redirect: false };
          case 'load_more': return { link: ``, method: 'normal', name: 'EDITOR_LOAD_MORE', redirect: false };
          case 'load_more_review': return { link: ``, method: 'normal', name: 'EDITOR_LOAD_MORE_REVIEW',
            redirect: false };
          case 'markdown': return { link: `https://markdown-it.github.io/`, method: 'none', redirect: true };
          case 'more_chapters': return { link: `getDashboard/book/${data.pId}/chapters/${data.cId}/${data.offset}`,
            method: 'get', redirect: false
          };
          case 'no_position': return { link: ``, method: 'normal', name: 'NO_POSITION_FAILURE', redirect: false };
          case 'open_add_author': return { link: ``, method: 'normal', name: 'OPEN_ADD_AUTHOR', redirect: false };
          case 'open_choose_parent': return { link: ``, method: 'normal', name: 'OPEN_CHOOSE_PARENT', redirect: false };
          case 'open_choose_volume': return { link: ``, method: 'normal', name: 'OPEN_CHOOSE_VOLUME', redirect: false };
          case 'preview': return { link: ``, method: 'normal', name: 'EDITOR_PREVIEW', redirect: false };
          case 'remove_author': return { link: ``, method: 'normal', name: 'REMOVE_AUTHOR', redirect: false };
          case 'remove_title': return { link: ``, method: 'normal', name: 'REMOVE_TITLE', redirect: false };
          case 'review_rating': return { link: ``, method: 'normal', name: 'RATE_REVIEW', redirect: false };
          case 'set_autoindex': return { link: ``, method: 'normal', name: 'SET_AUTOINDEX', redirect: false };
          case 'set_draft': return { link: ``, method: 'normal', name: 'SET_DRAFT', redirect: false };
          case 'schedule_type': return { link: ``, method: 'normal', name: 'OPEN_SCHEDULE_TYPE', redirect: false };
          case 'submit': return { link: `editor/submit/${data.type}`, name: data.type === 'comment' || data.type === 'typo' ? 'POST_COMMENT' :
            data.type === 'review' ? 'POST_REVIEW' : '',  method: 'post', redirect: false };
          default: return null;
        }
      case 'fiction':
        switch (action) {
          case 'authors': return { link: `fiction//${data.id}/authors`, method: 'get', redirect: true };
          case 'book': return { link: `fiction/${data.title}/${data.id}`, method: 'none', name: 'GET_FICTION',
            redirect: true };
          case 'categories': return { link: `fiction/categories/${data.id}`, method: 'get', redirect: false };
          case 'category': return { link: `browse/categories/${data.id}`, method: 'none', redirect: true };
          case 'chapter': return { link: `${data.book}/chapter/${data.num}/${data.id.includes('articles') ?
            data.id.split('/')[1] : data.id}`, method: 'none', redirect: true };
          case 'comments': return { 
            link: `${data.tab === 'dashboard' ? 'dashboard/' : ''}${data.id}/comments/${data.offset}`, method: 'get',
            redirect: false
          };
          case 'close_volumes': return { link: ``, method: 'normal', name: 'FICTION_CLOSE_VOLUMES', redirect: false };
          case 'dashboard': return { link: `dashboard/${data.type}/${data.id}`, method: 'none', name: 'GET_DASHBOARD',
            redirect: true };
          case 'delete_chapter': return { link: `delete`, method: 'normal', redirect: false };
          case 'donate': return { link: `fiction/donate/${data.id}`, method: 'get', redirect: false };
          case 'confirm_donate': return { link: `fiction/donate/${data.id}`, method: 'post', redirect: false };
          case 'dashboard': return { link: `dashboard/${data.id}`, method: 'none', name: 'GET_FICTION_DASHBOARD',
            redirect: true };
          case 'down': return { link: `fiction/rating/${data.id}`, method: 'post', redirect: false };
          case 'down_remove': return { link: `remove/rating/${data.rId}`, method: 'post', redirect: false };
          case 'edit_book': return { link: `edit/${data.id}`, method: 'get', redirect: false };
          case 'edit_chapter': return { link: `edit/${data.id}`, method: 'get', redirect: true };
          case 'expand': return { link: ``, method: 'normal', name: 'FICTION_EXPAND', redirect: false };
          case 'favorite': return { link: `fiction/rating/${data.id}`, method: 'post', redirect: false };
          case 'favorite_remove': return { link: `remove/rating/${data.rId}`, method: 'post', redirect: false };
          case 'fiction': return { link: `fiction/${data.title}/${data.id}`, method: 'none', name: 'GET_FICTION',
            redirect: true };
          case 'follow': return { link: `fiction/rating/${data.id}`, method: 'post', redirect: false };
          case 'follow_remove': return { link: `remove/rating/${data.rId}`, method: 'post', redirect: false };
          case 'list': return { link: `fiction/list/${data.id}`, method: 'get', redirect: false };
          case 'more_works': return { link: `getWorks/${data.offset}`, method: 'get', name: 'GET_MORE_WORKS',
            redirect: false };
          case 'confirm_list': return { link: `fiction/list/${data.id}`, method: 'post', redirect: false };
          case 'no_chapter': return { link: `/`, method: 'none', redirect: false };
          case 'open_rate': return { link: `rate`, method: 'normal', name: 'OPEN_RATE', redirect: false };
          case 'confirm_rate': return { link: `editor/submit/review`, method: 'post', name: 'POST_REVIEW', 
            redirect: false };
          case 'confirm_edit_rate': return { link: `editor/edit/review`, method: 'post', name: 'POST_REVIEW_EDIT', 
            redirect: false };
          case 'report': return { link: `report/fiction/${data.id}`, method: 'normal', name: 'FICTION_REPORT',
            redirect: false };
          case 'confirm_report': return { link: `report/fiction`, method: 'post', redirect: false };
          case 'reviews': return { link: `${data.id}/reviews/${data.offset}`, method: 'get', redirect: false };
          case 'series': return { link: `series/${data.title}/${data.id ? data.id : data.fId}`, method: 'none',
            redirect: true };
          case 'slider': return { link: ``, method: 'normal', name: 'FICTION_SLIDER', redirect: false };
          case 'sponsors': return { link: `fiction//${data.id}/sponsors`, method: 'get', redirect: true };
          case 'start': return { link: `fiction/start/${data.id}`, method: 'none', redirect: true };
          case 'subscribe': return { link: `fiction/subscribe/${data.id}`, method: 'get', redirect: false };
          case 'confirm_subscribe': return { link: `fiction/subscribe/${data.id}`, method: 'post', redirect: false };
          case 'tag': return { link: `browse/tags/${data.id}`, method: 'none', redirect: true };
          case 'tags': return { link: `fiction/tags/${data.id}`, method: 'get', redirect: false };
          case 'typos': return { link: `${data.tab === 'dashboard' ? 'dashboard/' : ''}${data.id}/typos/${data.offset}`,
            method: 'get', redirect: false };
          case 'universe': return { link: `universe/${data.title}/${data.id ? data.id : data.fId}`, method: 'none',
            redirect: true };
          case 'up': return { link: `fiction/rating/${data.id}`, method: 'post', redirect: false };
          case 'up_remove': return { link: `remove/rating/${data.rId}`, method: 'post', redirect: false };
          case 'volume': return { link: `${data.id}/volume`, method: 'get', redirect: false };
          case 'volumes': return { link: `${data.id}/volumes`, method: 'get', redirect: false };
          default: return null;
        }
      case 'list':
        switch (action) {
          case 'add': return { link: `add/list`, method: 'post', redirect: false };
          case 'delete_item': return { link: `delete/list_item`, method: 'post', redirect: false };
          case 'delete': return { link: `delete/list`, method: 'post', redirect: false };
          case 'edit': console.log("TYPE: " + type); return { link: `edit/list`, method: 'post', redirect: false };
          case 'expand': return { link: `delete/list`, method: 'post', redirect: false };
          case 'list': return { link: `list/${data.title}/${data.id}/0`, method: 'none', redirect: true };
          case 'more_info': return { link: ``, method: 'normal', name: 'LIST_ITEM_EXPAND', redirect: false };
          case 'down': return { link: 'user/down', method: 'post', redirect: false };
          default: return null;
        }
      case 'navigation':
        switch (action) {
          case 'add': return { link: ``, method: 'normal', name: 'NAVIGATION_ADD', redirect: false };
          case 'confirm_add': return { link: `submit/${data.type[data.id]}`, method: 'none', redirect: true };
          case 'home': return { link: ``, method: 'none', redirect: true };
          case 'lists': return { link: `lists`, method: 'get', redirect: true };
          case 'messages': return { link: `messages`, method: 'get', redirect: true };
          case 'notifications': return { link: `notifications`, method: 'get', redirect: true };
          case 'no_year': return { link: ``, method: 'normal', name: 'DASHBOARD_NO_YEAR_FAILURE', redirect: false };
          case 'profile': return { link: `profile`, method: 'none', redirect: true };
          case 'works': return { link: `works/0`, method: 'get', redirect: true };
          default: return null;
        }
      case 'popup':
        switch (action) {
          case 'close': return { link: ``, method: 'normal', name: 'CLOSE_POPUP', redirect: false };
          case 'review_rating': return { link: ``, method: 'normal', name: 'POPUP_RATE_REVIEW', redirect: false };
          default: return null;
        }
      case 'review':
        switch (action) {
          case 'edit': return { link: `edit/review`, method: 'normal', name: 'EDIT_REVIEW', redirect: false };
          case 'reviews': return { link: `${data.id}/reviews/${data.offset}`, method: 'get', redirect: false };
          default: return null;
        }
      case 'typo':
        switch (action) {
          case 'typos': return { link: `${data.id}/typos/${data.offset}`, method: 'get', redirect: false };
          default: return null;
        }
      case 'user':
        switch (action) {
          case 'add_friend': return { link: `${data.id}/add`, method: 'post', redirect: false };
          case 'change_avatar': return { link: `${data.id}/avatar`, method: 'none', redirect: true };
          case 'chapters': return { link: `chapters/${data.id}/0/false`, method: 'get', redirect: false };
          case 'expand_friends': return { link: `${data.id}/friends/${data.offset}`, method: 'get', redirect: false };
          case 'favorites': return { link: `${data.id}/favorites/0`, method: 'get', redirect: false };
          case 'fictions': return { link: `user/${data.id}/0/false`, method: 'none', redirect: true };
          case 'lists': return { link: `users/${data.id}/lists/0`, method: 'none', redirect: true };
          case 'profile': return { link: `user/${data.name}/${data.id}`, method: 'none', redirect: true };
          case 'open_avatar': return { link: `${data.id}/avatar`, method: 'none', redirect: false };
          case 'remove_friend': return { link: `friend/${data.cId}/remove`, method: 'post', redirect: false };
          case 'report': return { link: `${data.id}/report`, method: 'get', redirect: false };
          case 'reviews': return { link: `${data.id}/reviews/0`, method: 'get', redirect: false };
          case 'send_message': return { link: `${data.id}/message`, method: 'get', redirect: false };
          default: return null;
        }
      default: return null;
    };
  }

  handleClick (e) {
    const { type, action, data={}, get, normal, post } = this.props;
    const linkData = this.getLinkData();
    const method = linkData.method;
    const name = linkData.name ? linkData.name :
      `${method}_${type}_${action}`.toUpperCase();
    const url = linkData.link;
    const redirect = linkData.redirect;

    if (!redirect) e.preventDefault();

    //console.log(method + " request to " + url + " (" + name + "): " + JSON.stringify(data) + "|" + data);
    method === 'normal' ? normal(name, data) : method === 'none' ? false : method === 'get' ? get(name, url) :
      post(name, url, data);
  }
  
  render() {
    const { action, className, children, name, type } = this.props;
    const linkData = this.getLinkData();
    const redirect = linkData.redirect;
    const url = !redirect ? linkData.link : linkData.link.replace(`${type}s/`, '');

    return (
      <ReactLink to={url.includes('http') ? url : '/' + url} onClick={this.handleClick} className={className} >
        {name === '' ? children : name}
      </ReactLink>
    );
  }
}

Link.propTypes = {
  data: PropTypes.object,
  className: PropTypes.string,
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};


export default connect(null, { get, normal, post })(Link);