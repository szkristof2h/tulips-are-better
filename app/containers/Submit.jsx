import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import requiredIf from 'react-required-if';
import Link from '../components/Link';
import Editor from '../components/Editor';
import Schedule from '../components/Schedule';
import SubmitTextInput from '../components/SubmitTextInput';

import classNames from 'classnames/bind';
import styles from '../css/components/submit';

import { pasting, typing } from '../actions/editor';
import logo from "../images/logo.png";
import add_w40 from "../images/add_w40.png";
import checkbox_w40 from "../images/checkbox_w40.png";
import delete_w40 from "../images/delete_w40.png"; 
import tick_w40 from "../images/tick_w40.png";
import SubmitButton from '../components/SubmitButton';

const cx = classNames.bind(styles);

class Submit extends Component {
  render() {
    const { authors, autoIndex, formatting, indexes, isDraft, isPasting, isFetching, parents, pasting,
      preview, texts, title, type, typing, values, volumes } = this.props;


    if (isFetching !== 'submit_loaded') return <div>LOADING...</div>;
    if (parents.length === 0 && (type === 'chapter' || type === 'volume')) {
      return <div className = { cx('main') }>
        <img className={cx('logo')} src={logo} />
      <div className={cx('')}>You don't have any books, create one first.</div>
      </div >
    }

    const categories = ['ACTION', 'ADVENTURE', 'COMEDY', 'CRIME', 'DRAMA', 'FANTASY', 'HISTORICAL', 'HORROR', 'MYSTERY',
      'ROMANCE', 'SCI-FI', 'SLICE OF LIFE', 'THRILLER', 'WESTERN', 'XIANXIA', 'XUANHUAN'];
    let catElement = [];
    
    categories.forEach((c, i) => {
      catElement.push(<div className={cx('d-text')}>{c}</div>);
      catElement.push(<img className={cx('icon')} alt={c} title={c} src={values.categories[i] ? tick_w40 :
        checkbox_w40} />);
    });

    const submission = {
      title: title !== '' ? title : { error: `Your new ${type} should have a title!` },
      parentId: values.parent != -1 ? parents[values.parent].id : type === 'universe' || type === 'series'
        || type === 'book' ? '' : { error: `Your new ${type} needs to have a book.` },
      categories: type === 'book' ? values.categories.filter(c => c).length < 3 ?
        { error: `A book needs at leas 3 categories.` } :
        values.categories.map((c, i) => c ? categories[i] : null).filter(c => c !== null) : '',
      tags: type === 'book' ? values.tags.split(',').filter(t => t.trim() != '').length < 3 ?
        { error: `A book needs at leas 3 tags.` } :
        values.tags : '',
      schedule: values.schedule,// validate here as well
      followerChapters: values.followerChapters,
      draft: isDraft,
      autoIndex,
      authors: authors.length != 0 ? authors : { error: `Your new ${type} should have at least one author.` },
      authorNote: indexes['author_note'] ? texts[indexes['author_note']].split(/(?:\r\n|\r|\n)/g) : '',
      body: type === 'volume' ? '' : texts[0] !== '' ? texts[0].split(/(?:\r\n|\r|\n)/g) :
        { error: `You should write some text for the ${type}.` },
      afterNote: type === 'chapter' && indexes['after_note'] ? texts[indexes['after_note']].split(/(?:\r\n|\r|\n)/g): '',
      type
    };

    let errors = [];
    
    Object.keys(submission).forEach(k => {
      typeof submission[k] === 'object' && submission[k].error && errors.push(submission[k].error);
    });

    return (
      <div className={cx('main')}>        
        <img className={cx('logo')} src={logo} />
        <div className={cx('details')}>
          <div className={cx('container')}>
            <div className={cx('label')}>Title</div>
            <div className={cx('chapter-count')}>
              {autoIndex && ((type === 'volume' && values.volumeCount) || (type === 'chapter' && values.chapterCount)) && `${type} ${values[type === 'volume' ? 'volumeCount' : 'chapterCount']}:`}
            </div>
            <SubmitTextInput
              className={cx('input')}
              index={0}
              placeholder=''
              type='editor-title'
              onEntryChange={typing} />
          </div>
          {type !== 'universe' && <div className={cx('container', 'parent-chooser')}>
            <div className={cx('label')}>Parent</div>
            <Link
              className={cx('value')}
              type='editor'
              action='open_choose_parent'
              data={{
                title: 'Choose a book', color: 'green', type: 'editor', action: 'choose_parent',
                ids: parents.map((p, i) => i),
                list: parents.map(p => p.title),
                data: { ids: parents.map((p, i) => i), parents }
              }}
              name={values.parent === -1 ? `Choose a ${type === 'chapter' || type === 'volume' ? 'book' :
                type === 'book' ? 'series' : 'universe'} for the ${type}` : parents[values.parent].title} />
          </div>}
          {type === 'chapter' && values.volume != -1 ? <div className={cx('container', 'parent-chooser')}>
            <div className={cx('label')}>Volume</div>
            <div className={cx('value')}>Volume {values.volume + 1}: {volumes[values.volume].title}</div>
            {/*<Link
              className={cx('value')}
              type='editor'
              action='open_choose_volume'
              data={{
                title: 'Choose a volume', color: 'green', type: 'editor', action: 'choose_volume',
                ids: volumes.map((v, i) => i),
                list: volumes.map((v, i) => v.title),
                data: { ids: volumes.map((v, i) => i), volumes }
              }}
              name={values.volume === -1 ? `Choose a volume for the chapter` : `Volume ${values.volume + 1}: 
              ${volumes[values.volume].title}`} />*/}
          </div> : ''}
          {type === 'book' && <div className={cx('container', 'categories')}>
            <div className={cx('label')}>Categories</div>
            <div className={cx('list')}>
              {categories.map((c, i) => <Link
                key={`sC${c}${i}`}
                className={cx('category')}
                type='editor'
                action='category'
                data={{ index: i }}
                name=''>
                <img className={cx('icon')} alt={c} title={c} src={values.categories[i] ? tick_w40 : checkbox_w40} />
                <div className={cx('d-text')}>{c}</div>
              </Link>)}
            </div>
          </div>}
          {type === 'book' && <div className={cx('container')}>
            <div className={cx('label')}>Tags</div>
            <SubmitTextInput
              className={cx('input')}
              index={0}
              placeholder='Tags separated by comma'
              type='editor-tags'
              onEntryChange={typing} />
          </div>}
          <div className={cx('container', 'authors')}>
            <div className={cx('label')}>Authors</div>
            <div className={cx('list')}>
              {authors.length !== 0 ? authors.map((a, i) =>
                <div key={`sA${a}${i}`} className={cx('value')}>
                  <div className={cx('name', 'ellipsis')}>
                    {`${a.name} (${a.positions.join(', ')})`}
                  </div>
                  <Link
                    className={cx('button')}
                    type='editor'
                    action='remove_author'
                    data={{ index: i }}
                    name=''>
                    <img className={cx('icon')} alt="add" title="add" src={delete_w40} />
                  </Link>
                </div>): 
              <div className={cx('value')}></div>}
            </div>
            <Link
              className={cx('button')}
              type='editor'
              action='open_add_author'
              data={{}}
              name=''>
              <img className={cx('icon')} alt="add" title="add" src={add_w40} />
            </Link>
          </div>
          {type === 'book' && <div className={cx('container', 'follower')}>
            <div className={cx('header')}>FOLLOWER-ONLY CHAPTERS</div>
            {Array(6).fill('').map((_, i) => 
              <Link
                key={`sFCH${i}`}
                className={cx('num', { active: values.followerChapters === i })}
                type='editor'
                action='follower_chapter'
                data={{ num: i }}
                name={i+''} />
            )}
          </div>}
          {type === 'book' && <Schedule
            schedule={values.schedule}
            typing={typing} 
            scheduleType={values.scheduleType}
            type='edit' />}
          {type !== 'volume' && <div className={cx('container', 'draft')}>
            <Link
              className={cx('button')}
              type='editor'
              action='set_draft'
              data={{}}
              name=''>
              <img className={cx('icon')} alt="draft" title="draft" src={isDraft ? tick_w40 : checkbox_w40} />
              <div className={cx('b-text')}>DRAFT</div>
            </Link>
            <Link
              className={cx('button')}
              type='editor'
              action='set_autoindex'
              data={{}}
              name=''>
              <img className={cx('icon')} alt="draft" title="draft" src={autoIndex ? tick_w40 : checkbox_w40} />
              <div className={cx('b-text')}>AUTO-INDEX {type.toUpperCase()}</div>
            </Link>
          </div>}
        </div>
        {type !== 'volume' && <div className={cx('info', 'auto-index')}>
          {`If auto-index is on the ${type} is automatically assigned a ${type} number, but if you turn it off it won't be
          in the same line as the other ${type}s (it will be considered a ${type === 'book' ? 'spin-off' : 'non-chapter'})
          .${type === 'book' ? '' : ' Though they can be found by navigating through chapters they won\'t appear in' +
          ' the table of contents.'}`}
        </div>}
        {type !== 'volume' && <div className={cx('info',)}>
          Our editor is using markdown and is still a work-in-progress. Formatted texts that
          are pasted from other websites will partially reserve its formatting & layout (currently bold, italics and
          strikethrough text, and tables, lists and images will be preserved) if chosen to.
        </div>}
        {type === 'chapter' && indexes['author_note'] ?
            <Editor
              formatting={formatting[indexes['author_note']]}
              index={indexes['author_note']}
              isPasting={isPasting}
              pasting={pasting}
              placeholder={'Author\'s Note'}
              preview={preview[indexes['author_note']]}
              type='note'
              typing={typing}
              value={texts[indexes['author_note']]}
            /> : type === 'chapter' &&
            <Link
              className={cx('load-button')}
              type='editor'
              action='load_more'
              data={{ type: 'author_note' }}
              name=''>
              <img className={cx('icon')} alt="add" title="add" src={add_w40} />
              <div className={cx('b-text')}>ADD AUTHOR'S NOTE</div>
            </Link>
        }
        {type !== 'volume' && <Editor 
          formatting={formatting[0]}
          index={0}
          isPasting={isPasting}
          pasting={pasting}
          placeholder={'Write something'}
          preview={preview[0]}
          type='normal'
          typing={typing}
          value={texts[0]}
        />}
        {type === 'book' || type === 'chapter' ?
          (type === 'book' && indexes['author_note']) || (type === 'chapter' && indexes['after_note']) ?
            <Editor
              formatting={formatting[indexes[`${type === 'book' ? 'author' : 'after'}_note`]]}
              index={indexes[`${type === 'book' ? 'author' : 'after'}_note`]}
              isPasting={isPasting}
              pasting={pasting}
              placeholder={`${type === 'book' ? 'Author\'s' : 'After'} note`}
              preview={preview[indexes[`${type === 'book' ? 'author' : 'after'}_note`]]}
              type='note'
              typing={typing}
              value={texts[indexes[`${type === 'book' ? 'author' : 'after'}_note`]]}
            /> :
            <Link
              className={cx('load-button')}
              type='editor'
              action='load_more'
              data={{ type: `${type === 'book' ? 'author' : 'after'}_note` }}
              name=''>
              <img className={cx('icon')} alt="add" title="add" src={add_w40} />
              <div className={cx('b-text')}>{`ADD ${type === 'book' ? 'AUTHOR\'S' : 'AFTER'} NOTE`}</div>
            </Link>
          : ''}
        <SubmitButton errors={errors} submission={submission} type={type} /> 
      </div>
    );
  }
}

Submit.propTypes = {
  authors: requiredIf(PropTypes.array, props => props.isFetching === 'submit_loaded'),
  autoIndex: requiredIf(PropTypes.bool, props => props.isFetching === 'submit_loaded'),
  formatting: requiredIf(PropTypes.array, props => props.isFetching === 'submit_loaded'),
  indexes: requiredIf(PropTypes.object, props => props.isFetching === 'submit_loaded'),
  isFetching: PropTypes.string.isRequired,
  isDraft: requiredIf(PropTypes.bool, props => props.isFetching === 'submit_loaded'),
  isPasting: requiredIf(PropTypes.bool, props => props.isFetching === 'submit_loaded'),
  parents: requiredIf(PropTypes.array, props => props.isFetching === 'submit_loaded'),
  preview: requiredIf(PropTypes.array, props => props.isFetching === 'submit_loaded'),
  title: requiredIf(PropTypes.string, props => props.isFetching === 'submit_loaded'),
  type: requiredIf(PropTypes.string, props => props.isFetching === 'submit_loaded'),
  values: requiredIf(PropTypes.object, props => props.isFetching === 'submit_loaded'),
  volumes: PropTypes.array
};

function mapStateToProps(state) {
  return state.editor.isFetching !== 'submit_loaded' ? { isFetching: state.editor.isFetching } : {
    authors: state.editor.authors,
    autoIndex: state.editor.autoIndex,
    formatting: state.editor.settings.formatting,
    indexes: state.editor.indexes,
    isDraft: state.editor.isDraft,
    isFetching: state.editor.isFetching,
    isPasting: state.editor.settings.isPasting,
    parents: state.editor.parents,
    preview: state.editor.settings.preview,
    texts: state.editor.texts,
    title: state.editor.title,
    type: state.editor.type,
    values: state.editor.values,
    volumes: state.editor.volumes
  };
}

export default connect(mapStateToProps, { pasting, typing })(Submit);