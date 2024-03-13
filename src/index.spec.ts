import assert = require('assert');
import { isError, boxRequest, boxResponse, Session, unboxRequest, unboxResponse } from './index';
import * as crypto from 'crypto';

const EXIT_NODE_PK = '03d73c98d44618b7504bab1001adaa0a0c77adfb04db4b7732b1daba5e6523e7bf';
const EXIT_NODE_SK = '06ef2a621eb9df81f7d6a8f7a2499b9e670613f757648dc3258640767ebd7e0a';
const EXIT_NODE = '16Uiu2HAmUsJwbECMroQUC29LQZZWsYpYZx1oaM1H9DBoZHLkYn12';
const ENTRY_NODE = '16Uiu2HAm35DuQk2Cvp9aLpRTD43ZubLqtbAwf242w2YmAe8FskLs';

const TEST_VECTOR_EPHEMERAL_SECRET =
    'a27198fe268cd0af95a8c39788d44fc26638971e77ded9ee965b37e5d5d4a553';

function fromHex(str: string) {
    return Uint8Array.from(Buffer.from(str, 'hex'));
}

function toHex(bytes: Uint8Array | undefined) {
    if (!bytes) return '';
    return Buffer.from(bytes).toString('hex');
}

describe('crypto', function () {
    it('test request flow', async function () {
        // Client side
        const request_msg = new Uint8Array(crypto.randomBytes(300));
        const request_uuid = crypto.randomUUID();

        const request_data = {
            message: request_msg,
            uuid: request_uuid,
            exitPeerId: EXIT_NODE,
            exitPublicKey: fromHex(EXIT_NODE_PK),
            counterOffset: 0,
        };

        const req_box_result = boxRequest(request_data);
        assert(
            !isError(req_box_result),
            `request boxing must not fail, error: ${
                isError(req_box_result) && req_box_result.error
            }`,
        );

        const client_request_session = req_box_result.session;
        assert(client_request_session != undefined, 'must contain a valid session');
        assert(client_request_session.request != undefined, 'session must contain request data');

        // Client side end

        const client_req_creation_ts = client_request_session.updatedTS;
        const data_on_wire = client_request_session.request;
        // also request_uuid gets sent next to the data

        // Exit node side

        const received_req_data = {
            message: data_on_wire,
            uuid: request_uuid,
            exitPeerId: EXIT_NODE,
            exitPrivateKey: fromHex(EXIT_NODE_SK),
        };

        const req_unbox_result = unboxRequest(received_req_data);
        assert(
            !isError(req_unbox_result),
            `request unboxing must not fail, error: ${
                isError(req_unbox_result) && req_unbox_result.error
            }`,
        );

        const exit_request_session = req_unbox_result.session;
        assert(exit_request_session != undefined, 'must contain a valid session');

        assert.equal(toHex(exit_request_session.request), toHex(request_msg));
        assert.equal(exit_request_session.updatedTS, client_req_creation_ts);
    });

    it('test response flow', async function () {
        // Exit node side
        const response_msg = new Uint8Array(crypto.randomBytes(300));
        const response_uuid = crypto.randomUUID();

        const mock_session_with_client: Session = {
            updatedTS: BigInt(1),
            sharedPreSecret: fromHex(TEST_VECTOR_EPHEMERAL_SECRET),
        };

        const response_data = {
            message: response_msg,
            uuid: response_uuid,
            entryPeerId: ENTRY_NODE,
        };

        const resp_box_result = boxResponse(mock_session_with_client, response_data);
        assert(
            !isError(resp_box_result),
            `response boxing must not fail, error: ${
                isError(resp_box_result) && resp_box_result.error
            }`,
        );
        assert(mock_session_with_client.response != undefined);

        // Exit node side end

        const exit_node_resp_creation_ts = mock_session_with_client.updatedTS;
        const data_on_wire = mock_session_with_client.response;
        // also request_uuid gets sent next to the data

        // Client node side

        const received_resp_data = {
            message: data_on_wire,
            uuid: response_uuid,
            entryPeerId: ENTRY_NODE,
        };

        const mock_session_with_exit_node: Session = {
            updatedTS: BigInt(1),
            sharedPreSecret: fromHex(TEST_VECTOR_EPHEMERAL_SECRET),
        };

        const resp_unbox_result = unboxResponse(mock_session_with_exit_node, received_resp_data);
        assert(
            !isError(resp_unbox_result),
            `response unboxing must not fail, error: ${
                isError(resp_unbox_result) && resp_unbox_result.error
            }`,
        );

        assert(mock_session_with_exit_node.response != undefined);
        assert.equal(toHex(mock_session_with_exit_node.response), toHex(response_msg));
        assert.equal(mock_session_with_exit_node.updatedTS, exit_node_resp_creation_ts);
    });

    it('test complete flow', async function () {
        // Client side
        const request_msg = new Uint8Array(crypto.randomBytes(300));
        const request_uuid = crypto.randomUUID();

        const request_data = {
            message: request_msg,
            uuid: request_uuid,
            exitPeerId: EXIT_NODE,
            exitPublicKey: fromHex(EXIT_NODE_PK),
            counterOffset: 0,
        };

        const req_box_result = boxRequest(request_data);
        assert(
            !isError(req_box_result),
            `request boxing must not fail, error: ${
                isError(req_box_result) && req_box_result.error
            }`,
        );

        const client_session = req_box_result.session;
        assert(client_session != undefined, 'must contain a valid session');
        assert(client_session.request != undefined, 'session must contain request data');

        // Client side end

        const client_req_creation_ts = client_session.updatedTS;
        const request_data_on_wire = client_session.request;
        // also request_uuid gets sent next to the data

        // Exit node side

        const received_req_data = {
            message: request_data_on_wire,
            exitPeerId: EXIT_NODE,
            uuid: request_uuid,
            exitPrivateKey: fromHex(EXIT_NODE_SK),
        };

        const req_unbox_result = unboxRequest(received_req_data);
        assert(
            !isError(req_unbox_result),
            `request unboxing must not fail, error: ${
                isError(req_unbox_result) && req_unbox_result.error
            }`,
        );

        const exit_session = req_unbox_result.session;
        assert(exit_session != undefined, 'must contain a valid session');

        assert.equal(toHex(exit_session.request), toHex(request_msg));
        assert.equal(exit_session.updatedTS, client_req_creation_ts);

        // Exit node side
        const response_msg = new Uint8Array(crypto.randomBytes(300));
        const response_uuid = crypto.randomUUID();

        const response_data = {
            message: response_msg,
            uuid: response_uuid,
            entryPeerId: ENTRY_NODE,
        };

        const resp_box_result = boxResponse(exit_session, response_data);
        assert(
            !isError(resp_box_result),
            `response boxing must not fail, error: ${
                isError(resp_box_result) && resp_box_result.error
            }`,
        );
        assert(exit_session.response != undefined);

        // Exit node side end

        const exit_node_resp_creation_ts = exit_session.updatedTS;
        const response_data_on_wire = exit_session.response;
        // also response_uuid gets sent next to the data

        // Client node side

        const received_resp_data = {
            message: response_data_on_wire,
            uuid: response_uuid,
            entryPeerId: ENTRY_NODE,
        };

        const resp_unbox_result = unboxResponse(client_session, received_resp_data);
        assert(
            !isError(resp_unbox_result),
            `response unboxing must not fail, error: ${
                isError(resp_unbox_result) && resp_unbox_result.error
            }`,
        );

        assert(client_session.response != undefined);
        assert.equal(toHex(client_session.response), toHex(response_msg));
        assert.equal(client_session.updatedTS, exit_node_resp_creation_ts);
    });
});
