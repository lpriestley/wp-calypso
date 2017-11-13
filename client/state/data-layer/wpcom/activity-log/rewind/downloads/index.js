/**
 * External dependencies
 *
 * @format
 */

import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { REWIND_BACKUP } from 'state/action-types';
import { rewindBackupUpdateError, getRewindBackupProgress } from 'state/activity-log/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

const createBackup = ( { dispatch }, action ) => {
	dispatch(
		http(
			{
				method: 'POST',
				apiNamespace: 'wpcom/v2',
				path: `/sites/${ action.siteId }/rewind/downloads`,
				body: {
					rewindId: action.rewindId,
				},
			},
			action
		)
	);
};

const fromApi = data => ( {
	downloadId: +data.downloadId,
} );

export const receiveBackupSuccess = ( { dispatch }, { siteId }, apiData ) => {
	const { downloadId } = fromApi( apiData );
	if ( downloadId ) {
		dispatch( getRewindBackupProgress( siteId, downloadId ) );
	} else {
		dispatch(
			rewindBackupUpdateError( siteId, {
				status: 'finished',
				error: 'missing_download_id',
				message: 'Bad response. No download ID provided.',
			} )
		);
	}
};

export const receiveBackupError = ( { dispatch }, { siteId }, error ) => {
	dispatch( rewindBackupUpdateError( siteId, pick( error, [ 'error', 'status', 'message' ] ) ) );
};

export default {
	[ REWIND_BACKUP ]: [ dispatchRequest( createBackup, receiveBackupSuccess, receiveBackupError ) ],
};
