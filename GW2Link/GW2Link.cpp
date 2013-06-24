// GW2Link.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <iostream>
#include <winsock2.h>
#include <string>
#include <sstream>

#include "GW2Linker.h"

int _tmain(int argc, _TCHAR* argv[])
{
	std::cout << "Starting GW2 Link\n";
	GW2Linker *linker = new GW2Linker();

	WORD sockVersion;
	WSADATA wsaData;
	sockVersion = MAKEWORD(1, 1);
	WSAStartup(sockVersion, &wsaData);
	SOCKET listeningSocket;
	SOCKET theClient;
	SOCKADDR_IN serverInfo;
	serverInfo.sin_family = AF_INET;
	serverInfo.sin_addr.s_addr = INADDR_ANY;
	serverInfo.sin_port = htons(8428);

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

	while(true) {
		sockaddr  cAddr;
        memset(&cAddr, 0, sizeof(sockaddr ));
        int cAddrSize=sizeof(cAddr);

		theClient = accept(listeningSocket, &cAddr, &cAddrSize);
		if(theClient == INVALID_SOCKET) {
			std::cout << "Rejected client\n";
			Sleep(5000);
			WSACleanup();
			continue;
		}

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

		//std::cout << "Incoming\n";
		//std::cout << ipAddr[0] << "." << ipAddr[1] << "." << ipAddr[2] << "." << ipAddr[3] << "\n";

		if(ipFamily != 2) {
			std::cout << "Only IPv4 supported\n";
			continue;
		}

		if((ipAddr[0] == 127 && ipAddr[1] == 0 && ipAddr[2] == 0 && ipAddr[3] == 1) || (ipAddr[0] == 192 && ipAddr[1] == 168)) {
			//std::cout << ipAddr[0] << "." << ipAddr[1] << "." << ipAddr[2] << "." << ipAddr[3] << "\n";

			char buffer[512];
			if(recv(theClient, buffer, 512, 0) == 0) {
				Sleep(100);
				continue;
			}
			//std::cout << "Request received\n";
			

			std::stringstream jsonStream;
			jsonStream << "{\"version\":\"" << linker->getVersion() << "\",\"status\":\"" << linker->getStatus() << "\",\"game\":\"" << linker->getGame().c_str() << "\",\"name\":\"" << linker->getName() << "\",\"server\":\"" << linker->getServer()
			<< "\",\"map\":\"" << linker->getMap() << "\",\"pos\":[" << linker->getPosX() << "," << linker->getPosY() << "," << linker->getPosZ() << "]" 
			<< ",\"prot\":\"" << linker->getPlayerRot() << "\",\"crot\":\""<< linker->getCamRot() << "\"}\r\n\r\n";
		
			std::stringstream headerStream;
			headerStream << "HTTP/1.1 200 OK\r\n"
			<< "Access-Control-Allow-Origin: *\r\n"
			<< "Connection: close\r\n"
			<< "Content-Type: application/javascript; charset=utf-8\r\n"
			<< "Content-Length: " << strlen(jsonStream.str().c_str()) << "\r\n\r\n";

			std::string gw2json = headerStream.str().append(jsonStream.str());
			//std::cout << "Sending JSON\n";
			if(send( theClient, gw2json.c_str(), strlen( gw2json.c_str() ), 0 ) == SOCKET_ERROR ) {
				std::cout << "Failed to send json\n";
				Sleep(5000);
				WSACleanup();
				//return -1;
			}

			Sleep(100);
		}
		else {
			std::cout << ipAddr[0] << "." << ipAddr[1] << "." << ipAddr[2] << "." << ipAddr[3] << "\n";
			std::cout << "External IP detected\n";
		}
	}

	closesocket(theClient);
	closesocket(listeningSocket);
	WSACleanup();

	return 0;
}