// GW2Link.cpp : Defines the entry point for the console application.

#include "stdafx.h"
#include <iostream>
#include <winsock2.h>
#include <string>
#include <sstream>

#include "GW2Linker.h"

int _tmain(int argc, _TCHAR* argv[])
{
	std::cout << "Starting GW2 Link\n";
	#ifdef _DEBUG
	std::cout << "DEBUG\n";
	#endif // DEBUG

	GW2Linker *linker = new GW2Linker();
	std::cout << "Identity: " << linker->getIdentity() << "\n" ;

	// Initialize HTTP server
	WORD sockVersion;
	WSADATA wsaData;
	sockVersion = MAKEWORD(1, 1);
	WSAStartup(sockVersion, &wsaData);
	SOCKET listeningSocket;
	SOCKET theClient;
	SOCKADDR_IN serverInfo;
	serverInfo.sin_family = AF_INET;
	serverInfo.sin_addr.s_addr = INADDR_ANY;
	serverInfo.sin_port = htons(8428); // Port #
	DWORD timeoutMs = 2000; 

	listeningSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
	if (listeningSocket == INVALID_SOCKET) {
		std::cout << "Failed initializing listening socket\n";
		Sleep(5000);
		WSACleanup();
		return -1;
	}

	if (bind(listeningSocket, (LPSOCKADDR)&serverInfo, sizeof(struct sockaddr)) == SOCKET_ERROR) {
		std::cout << "Failed binding socket\n";
		Sleep(5000);
		WSACleanup();
		return -1;
	}

	// Listen for connections
	std::cout << "Listening for connection\n";
	while(listen(listeningSocket, 20) == SOCKET_ERROR){
		Sleep(20);
	}

	// Listen forever
	while(true) {
		#ifdef _DEBUG
		std::cout << "- - - - - - - - - - - - - - - - -\n";
		#endif // DEBUG

		sockaddr  cAddr;
        memset(&cAddr, 0, sizeof(sockaddr ));
        int cAddrSize=sizeof(cAddr);

		// Get a new request
		theClient = accept(listeningSocket, &cAddr, &cAddrSize);
		if(theClient == INVALID_SOCKET) {
			std::cout << "Rejected client\n";
			closesocket(theClient);
			continue;
		}

		// Parse the connecting IP address, to allow filtering down to LAN/Localhost
		int ipAddr[4];
		ipAddr[0] = cAddr.sa_data[2];
		ipAddr[1] = cAddr.sa_data[3];
		ipAddr[2] = cAddr.sa_data[4];
		ipAddr[3] = cAddr.sa_data[5];
		int ipFamily = cAddr.sa_family;

		for(int i = 0; i < 4; i++) {
			if (ipAddr[i] < 0)
				ipAddr[i] = 256 + ipAddr[i];
		}

		#ifdef _DEBUG
		std::cout << "Incoming request\n";
		std::cout << ipAddr[0] << "." << ipAddr[1] << "." << ipAddr[2] << "." << ipAddr[3] << "\n";
		#endif // DEBUG

		std::cout << "Identity: " << linker->getIdentity() << "\n";

		// No IPv6 support
		if(ipFamily != 2) {
			std::cout << "Only IPv4 supported\n";
			closesocket(theClient);
			continue;
		}

		// Accept the request if it's from a valid IP (127.0.0.1, or 192.168.*.*)
		if((ipAddr[0] == 127 && ipAddr[1] == 0 && ipAddr[2] == 0 && ipAddr[3] == 1) || (ipAddr[0] == 192 && ipAddr[1] == 168)) {
			#ifdef _DEBUG
			std::cout << "Valid IP\n";
			#endif // DEBUG

			setsockopt(theClient, SOL_SOCKET, SO_RCVTIMEO, (const char*) &timeoutMs, sizeof(timeoutMs));             
            setsockopt(theClient, SOL_SOCKET, SO_SNDTIMEO, (const char*) &timeoutMs, sizeof(timeoutMs));

			// Buffer request data
			char buffer[512];
			if(recv(theClient, buffer, 512, 0) == 0) {
				closesocket(theClient);
				continue;
			}

			#ifdef _DEBUG
			std::cout << "Request received\n";
			//std::cout << buffer << "\n";
			#endif // DEBUG

			// Verify header - request was for 'gw2.json'
			if(!std::strstr(buffer, "GET /gw2.json HTTP/1.1")) {
				std::cout << "Invalid request (Not for gw2.json)\n";
				closesocket(theClient);
				continue;
			}

			// Create JSON for reply
			std::stringstream jsonStream;
			jsonStream << "{\"version\":\"" << linker->getVersion() << "\",\"status\":\"" << linker->getStatus() << "\",\"game\":\"" << linker->getGame().c_str() << "\",\"identity\":" << linker->getIdentity()
			<< ",\"pos\":[" << linker->getPosX() << "," << linker->getPosY() << "," << linker->getPosZ() << "]" 
			<< ",\"prot\":\"" << linker->getPlayerRot() << "\",\"crot\":\""<< linker->getCamRot() << "\"}\r\n\r\n";
		
			// Create header for reply
			std::stringstream headerStream;
			headerStream << "HTTP/1.1 200 OK\r\n"
			<< "Access-Control-Allow-Origin: *\r\n"
			<< "Connection: close\r\n"
			<< "Content-Type: application/javascript; charset=utf-8\r\n"
			<< "Content-Length: " << strlen(jsonStream.str().c_str()) << "\r\n\r\n";

			std::string gw2json = headerStream.str().append(jsonStream.str());

			#ifdef _DEBUG
			std::cout << "Sending JSON\n";
			std::cout << jsonStream.str();
			#endif // DEBUG

			// Send reply
			if(send( theClient, gw2json.c_str(), strlen( gw2json.c_str() ), 0 ) == SOCKET_ERROR ) {
				std::cout << "Failed to send json\n";
				closesocket(theClient);
				continue;
			}
		}
		else {
			std::cout << ipAddr[0] << "." << ipAddr[1] << "." << ipAddr[2] << "." << ipAddr[3] << "\n";
			std::cout << "External IP detected\n";
		}

		// Clean up socket, and wait for the next connection
		closesocket(theClient);
	}

	closesocket(listeningSocket);
	WSACleanup();

	return 0;
}